import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { faExpandArrowsAlt, faArrowAltCircleDown, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { newsData, locationData, typeData } from '../data';

const getCurrentMonth = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
}

const formatDateString = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
}

const Stat: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  const isSbyt = params.has('sbyt');
  const isGen = params.has('gen');

  const headerTitle = isSbyt ? 'Статистика Сбыт' : isGen ? 'Статистика Генерация' : 'Нет данных';

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const getDaysInMonth = (dateString: string): number => {
    const date = new Date(`${dateString}-01`);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getPreviousMonth = (current: string): string => {
    const date = new Date(`${current}-01`);
    date.setMonth(date.getMonth() - 1);
    return formatDateString(date);
  };

  const getNextMonth = (current: string): string => {
    const date = new Date(`${current}-01`);
    date.setMonth(date.getMonth() + 1);
    return formatDateString(date);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const currentDate = new Date(currentMonth);
  const currentMonthName = currentDate.toLocaleString('ru', { month: 'long' });

  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toLocaleString('ru', { month: 'long' });
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toLocaleString('ru', { month: 'long' });

  const [isFullscreen, setIsFullscreen] = useState(false);

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

const downloadPDF = async () => {
  const doc = new jsPDF('p', 'px', 'a4'); 
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

    doc.save(`pr-stat-${currentMonth}.pdf`);

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
        <h1>{headerTitle} {currentMonthName} {currentDate.getFullYear()}</h1>
        <div className="top-buttons nosave">
          <button className="arrow" onClick={() => setCurrentMonth(getPreviousMonth(currentMonth))}>
            <FontAwesomeIcon icon={faAngleLeft} /> {previousMonth}
          </button>
          <div className="currentPeriod"><span>{currentMonthName}</span></div>
          <button className="arrow" onClick={() => setCurrentMonth(getNextMonth(currentMonth))}>
            {nextMonth} <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button onClick={downloadPDF}>
            <FontAwesomeIcon icon={faArrowAltCircleDown} title='Скачать PDF' />
          </button>          
          <button onClick={toggleFullscreen}>
              <FontAwesomeIcon icon={faExpandArrowsAlt} title='Полный экран' />
          </button>          
        </div>
      </div>
      
      {typeData.map(typeItem => (
        <div key={typeItem.id}>
          <h3>{typeItem.name}</h3>
          <table className="stat-table">
            <thead>
              <tr>
                <th>Площадка/число</th>
                {Array.from({ length: daysInMonth }, (_, day) => (
                  <th key={day + 1}>{day + 1}</th>
                ))}
                <th>Всего</th>
              </tr>
            </thead>
            <tbody>
              {locationData.map(locationItem => {
                const shouldDisplay =
                  (isSbyt && locationItem.name.includes("Сбыт")) || 
                  (isGen && locationItem.name.includes("Генерация"));
                
                if (!shouldDisplay) return null;

                // Подсчет новостей по дням
                const newsCountPerDay = Array(daysInMonth).fill(0);
                let totalNewsCount = 0;

                newsData.forEach(newsItem => {
                  const newsDate = new Date(newsItem.publicationDate);
                  const newsDay = newsDate.getDate();
                  const newsLocation = newsItem.location;
                  const newsType = newsItem.type;

                  // Проверяем условия
                  if (newsDate.getFullYear() === currentDate.getFullYear() && 
                      newsDate.getMonth() === currentDate.getMonth() &&
                      newsLocation === locationItem.id && 
                      newsType === typeItem.id) {
                    newsCountPerDay[newsDay - 1] += 1;
                    totalNewsCount += 1;
                  }
                });

                return (
                  <tr key={locationItem.id}>
                    <td>{locationItem.name}</td>
                    {newsCountPerDay.map((count, index) => {
                      // Определяем, является ли день выходным (суббота или воскресенье)
                      const isWeekend = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1).getDay() === 0 ||
                                        new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1).getDay() === 6;

                      return (
                        <td key={index + 1} className={isWeekend ? 'week' : ''}>{count}</td>
                      );
                    })}
                    <td>{totalNewsCount}</td> {/* Суммарное количество новостей */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
    </>
  );
};

export default Stat;
