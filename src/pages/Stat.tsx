import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { faExpandArrowsAlt, faFilePdf, faFileExcel, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
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
  const statType = isSbyt ? 'sbyt' : isGen ? 'gen' : '';

  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth());

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

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

    const canvas = await html2canvas(tableElement, { scale: 2 }); 
    const imgData = canvas.toDataURL('image/png');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth - 40; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width; 

    let heightLeft = imgHeight;
    let position = 10; 

    doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position);

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save(`pr-stat-${statType}-${currentMonth}.pdf`);

    elementsToHide.forEach(element => {
      element.classList.remove('hide');
    });
  }
};

const downloadXLS = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Статистика');

  // Установка заголовка с жирным текстом
  worksheet.getCell('A1').value = `${headerTitle} ${currentMonthName} ${currentDate.getFullYear()}`;
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  // Пустая вторая строка
  worksheet.addRow([]);

  type TableData = {
    title: string;
    data: Array<Array<number | string>>;
  };

  const tableData: TableData[] = [];

  typeData.forEach(typeItem => {
    let data: Array<Array<number | string>> = [];
    let header = [`Площадка/число`, ...Array.from({ length: daysInMonth }, (_, day) => day + 1), 'Всего'];

    data.push(header);


    locationData.forEach(locationItem => {
      const shouldDisplay =
        (isSbyt && locationItem.name.includes("Сбыт")) || 
        (isGen && locationItem.name.includes("Генерация"));

      if (!shouldDisplay) return;

      const newsCountPerDay = Array(daysInMonth).fill(0);
      let totalNewsCount = 0;

      newsData.forEach(newsItem => {
        const newsDate = new Date(newsItem.publicationDate);
        const newsDay = newsDate.getDate();
        const newsLocation = newsItem.location;
        const newsType = newsItem.type;

        if (newsDate.getFullYear() === currentDate.getFullYear() && 
            newsDate.getMonth() === currentDate.getMonth() &&
            newsLocation === locationItem.id && 
            newsType === typeItem.id) {
          newsCountPerDay[newsDay - 1] += 1;
          totalNewsCount += 1;
        }
      });

      const row = [locationItem.name, ...newsCountPerDay, totalNewsCount];
      data.push(row);
    });

    tableData.push({ title: typeItem.name, data });
  });

  // Заполнение таблицы в Excel
  tableData.forEach(({ title, data }) => {
    const headerRowValues = worksheet.addRow([title]);  
    headerRowValues.eachCell((cell, colNumber) => {
        cell.font = {
            bold: true,
        };
    });

    let i=1;
    data.forEach(row => {
      if (i === 1) { //Первая строка с датами месяца
        const headerRowValues = worksheet.addRow(row);  
        headerRowValues.eachCell((cell, colNumber) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF808A96' },
            };
            cell.font = {
                color: { argb: 'FFFFFFFF' },
            };
            cell.alignment = { 
              vertical: 'middle' 
            }; 
            i++;
        });
      } else {
        worksheet.addRow(row); // Данные        
      }
    });
    worksheet.addRow([]); // Пустая строка
  });

  // Установка ширины и стилей
  worksheet.getColumn(1).width = 20; // Установка ширины для 1 столбца
  for (let colNumber = 2; colNumber <= worksheet.columnCount; colNumber++) {
    worksheet.getColumn(colNumber).width = 3; // Установка ширины для остальных столбцов
    worksheet.getColumn(colNumber).alignment = { horizontal: 'center', vertical: 'middle' }; // Выровнять по центру
  }
  worksheet.getColumn(worksheet.columnCount).width = 5; // Установка ширины для последнего столбца

  // Скачивание файла
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);  
  link.download = `pr-stat-${statType}-${currentMonth}.xlsx`;
  link.click();
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
            <FontAwesomeIcon icon={faFilePdf} title='Скачать PDF' />
          </button>
          <button onClick={downloadXLS}>
            <FontAwesomeIcon icon={faFileExcel} title='Скачать XLS' />
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

                const newsCountPerDay = Array(daysInMonth).fill(0);
                let totalNewsCount = 0;

                newsData.forEach(newsItem => {
                  const newsDate = new Date(newsItem.publicationDate);
                  const newsDay = newsDate.getDate();
                  const newsLocation = newsItem.location;
                  const newsType = newsItem.type;

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
                      const isWeekend = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1).getDay() === 0 ||
                                        new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1).getDay() === 6;

                      return (
                        <td key={index + 1} className={isWeekend ? 'week' : ''}>{count}</td>
                      );
                    })}
                    <td>{totalNewsCount}</td>
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
