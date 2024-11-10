import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpandArrowsAlt, faFilePdf, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { fetchData } from '../api';
import { useUserContext } from '../components/UserContext';

interface DataPoint {
  id: string;
  name: string;
  type?: 'location' | 'type';
  planned: number;
  actual: number;
}

const getCurrentMonth = (): string => {
  const date = new Date();
  return date.toISOString().slice(0, 7); // Получаем формат "YYYY-MM"
};

// Функция форматирования месяца
const formatDateString = (date: Date): string => date.toISOString().slice(0, 7);

// Генерация данных для графика по заданному месяцу
const generateData = (month: string, newsData: any[], plannedData: any[], typeData: any[], locationData: any[]): DataPoint[] => {
  const result: DataPoint[] = [];

  typeData.forEach((type) => {
    const plannedForType = plannedData
      .filter((item) => item.type === type.id && item.month === month)
      .reduce((acc, item) => acc + item.planned, 0);
    
    const actualForType = newsData
      .filter((news) => news.type === type.id && news.publicationdate.startsWith(month)).length;

    if (actualForType > 0 || plannedForType > 0) {
      result.push({ 
        id: `type-${type.id}`, 
        name: type.name, 
        type: 'type',
        planned: plannedForType, 
        actual: actualForType 
      });
    }

    locationData.forEach((location) => {
      const actualForLocationType = newsData
        .filter(news => news.type === type.id && news.location === location.id && news.publicationdate.startsWith(month)).length;

      const plannedForLocationType = plannedData
        .find(item => item.type === type.id && item.location === location.id && item.month === month)?.planned || 0;

      if (actualForLocationType > 0 || plannedForLocationType > 0) {
        result.push({ 
          id: `location-${location.id}-type-${type.id}`, 
          name: location.name, 
          type: 'location',
          planned: plannedForLocationType, 
          actual: actualForLocationType 
        });
      }
    });
  });

  return result;
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p>{payload[0].payload.name}</p>
        <p>{`План: ${payload[0].payload.planned}`}</p>
        <p>{`Факт: ${payload[0].payload.actual}`}</p>
      </div>
    );
  }
  return null;
};

const Chart: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [locationData, setLocationData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [plannedData, setPlannedData] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { user, pass } = useUserContext();

  const loadData = async (url: string, method: string, data: any = null): Promise<any> => {
    const payload = { ...data, adminName: user, adminPass: pass };
    return await fetchData(url, method, payload);
  };

  const fromDate = `${currentMonth}-01`;
  const toDate = new Date(new Date(fromDate).getFullYear(), new Date(fromDate).getMonth() + 1, 0).toISOString().split('T')[0]; // Последний день месяца

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [locationData, typeData] = await Promise.all([
          loadData('/api/location/list', 'POST'),
          loadData('/api/type/list', 'POST'),
        ]);
        setLocationData(locationData);
        setTypeData(typeData);
      } catch (error) {
        console.error("Error loading data: ", error);
      }
    };

    loadInitialData();
  }, [user, pass]);

  useEffect(() => {
    const loadNewsAndPlannedData = async () => {
      try {
        const [newsData, plannedData] = await Promise.all([
          loadData('/api/news', 'POST', { from: fromDate, to: toDate }),
          loadData('/api/planned', 'POST', { from: fromDate, to: toDate }),
        ]);
        setNewsData(newsData);
        setPlannedData(plannedData);
      } catch (error) {
        console.error("Error loading data: ", error);
      }
    };

    loadNewsAndPlannedData();
  }, [currentMonth, user, pass]);

  const data: DataPoint[] = generateData(currentMonth, newsData, plannedData, typeData, locationData);

  const toggleFullscreen = () => {
      if (!isFullscreen) {
          document.documentElement.requestFullscreen();
      } else {
          document.exitFullscreen();
      }
  };

  useEffect(() => {
      const onFullscreenChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', onFullscreenChange);
      return () => {
          document.removeEventListener('fullscreenchange', onFullscreenChange);
      };
  }, []);
  
  const changeMonth = (offset: number): void => {
    const date = new Date(`${currentMonth}-01`);
    date.setMonth(date.getMonth() + offset);
    setCurrentMonth(formatDateString(date));
  };

  const currentMonthIndex = new Date(currentMonth).getMonth();
  const currentMonthName = new Date(0, currentMonthIndex).toLocaleString('ru', { month: 'long' });
  
  const previousMonth = new Date(0, (currentMonthIndex + 11) % 12).toLocaleString('ru', { month: 'long' });
  const nextMonth = new Date(0, (currentMonthIndex + 1) % 12).toLocaleString('ru', { month: 'long' });

  const downloadPDF = async () => {
    const doc = new jsPDF('l', 'px', 'a4'); 
    const tableElement = document.getElementById('saveBlock');
  
    if (tableElement) {
      const elementsToHide = document.querySelectorAll('.nosave');
      elementsToHide.forEach(element => {
        element.classList.add('hide');
      });
  
      const canvas = await html2canvas(tableElement, { scale: 2 }); // Увеличиваем разрешение
      const imgData = canvas.toDataURL('image/png');
      
      // Определяем ширину и высоту для изображения
      const pageWidth = doc.internal.pageSize.getWidth(); // Полная ширина страницы
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 40; // Ширина изображения с полями 20px с каждой стороны
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Пропорциональная высота
  
      let heightLeft = imgHeight;
      let position = 10; // Отступ сверху
  
      // Добавляем первое изображение
      doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight); // Левый отступ 20px
      heightLeft -= (pageHeight - position);
  
      // Добавляем дополнительные страницы, если это необходимо
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      doc.save(`pr-gr-${currentMonth}.pdf`);
  
      // Отображаем элементы снова
      elementsToHide.forEach(element => {
        element.classList.remove('hide');
      });
    }
  };
  

  return (
    <>
      <div id="saveBlock" className={`table-container ${isFullscreen ? 'fullscreen' : ''}`}
          style={{
            marginBottom: '100px',
          position: isFullscreen ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          width: isFullscreen ? '100vw' : 'auto',
          height: isFullscreen ? '100vh' : 'auto',
          backgroundColor: isFullscreen ? 'white' : 'transparent',
          zIndex: isFullscreen ? 9999 : 'auto',
          overflow: isFullscreen ? 'auto' : 'visible'
          }}      
      >
      <div className="header-container">
        <h1>График информационной активности {currentMonthName} {new Date(currentMonth).getFullYear()}</h1>
        <div className="top-buttons nosave">
          <button className="arrow" onClick={() => changeMonth(-1)}>
          <FontAwesomeIcon icon={faAngleLeft} /> {previousMonth}
          </button>
          <div className="currentPeriod"><span>{currentMonthName}</span></div>
          <button className="arrow" onClick={() => changeMonth(1)}>
            {nextMonth} <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button onClick={downloadPDF}>
            <FontAwesomeIcon icon={faFilePdf} title='Скачать PDF' />
          </button>          
          <button onClick={toggleFullscreen}>
              <FontAwesomeIcon icon={faExpandArrowsAlt} title='Полный экран' />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart
          data={data}          
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis 
            dataKey="id"
            height={54}
            interval={0}
            tick={({ x, y, payload }) => {
              const abbreviateName = (name: string) => {
                const lowerCaseName = name.toLowerCase();                
                let abbreviatedName = lowerCaseName;              
                if (lowerCaseName.includes('владимир')) {
                  abbreviatedName = abbreviatedName.replace('владимир ', 'вл.');
                }
                if (lowerCaseName.includes('иваново')) {
                  abbreviatedName = abbreviatedName.replace('иваново ', 'ив.');
                }
                if (lowerCaseName.includes('генерация')) {
                  abbreviatedName = abbreviatedName.replace('генерация', 'ген.');
                }              
                return abbreviatedName;
              };
              
              const currentData = data.find(d => d.id === payload.value);
              return (
                <g>
                  <text x={x} y={y + 12} textAnchor="middle" fontSize={9} transform={`rotate(-16 ${x},${y + 10})`}>
                    {currentData ? abbreviateName(currentData.name) : ''}
                  </text>
                  {currentData && (
                    <>
                      <text x={x} y={y + 10} textAnchor="middle" fontSize={11} dy={21}>
                        {`${currentData.planned}`}
                      </text>
                      <text x={x} y={y + 10} textAnchor="middle" fontSize={11} dy={36}>
                        {`${currentData.actual}`}
                      </text>
                    </>
                  )}
                </g>
              );              
            }}
          />
          <YAxis
            fontSize={12} 
            width={5}
           />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            verticalAlign="bottom"
            align="left"
            iconType="rect"
            wrapperStyle={{ bottom: 3, fontSize: '11px' }}
          />
          <Bar dataKey="planned" fill="#475466" barSize={20} name="План" />
          <Line type="monotone" dataKey="actual" stroke="#DF6336" strokeWidth="2" name="Факт" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
    </>
  );
};

export default Chart;
