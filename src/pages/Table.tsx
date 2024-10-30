import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpandArrowsAlt, faFileExcel, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { newsData, locationData, typeData, plannedData } from '../data';
import ExcelJS from 'exceljs';

const Table: React.FC = () => {
    const months: string[] = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('ru', { month: 'short' }));
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
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

    const getPlannedData = (typeId: number, month: string, locationId: number): number => {
        const plannedEntry = plannedData.find(
            (entry) => entry.type === typeId && entry.month === month && entry.location === locationId
        );
        return plannedEntry ? plannedEntry.planned : 0;
    };

    const filterNewsByTypeAndMonthAndLocation = (typeId: number, month: string, locationId: number): number => {
        return newsData.filter(
            (entry) => entry.type === typeId && entry.publicationDate.startsWith(month) && entry.location === locationId
        ).length;
    };

    const calculateDeviation = (planned: number, actual: number): number => {
        return actual - planned;
    };

    const generateTableData = (): (string | number)[][] => {
        const tableRows: (string | number)[][] = [];

        for (const type of typeData) {
            const typeRow: (string | number)[] = [type.name];

            let totalDeviation = 0;

            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const monthStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;

                let monthlyPlanned = 0;
                let monthlyActual = 0;

                for (const location of locationData) {
                    monthlyPlanned += getPlannedData(type.id, monthStr, location.id);
                    monthlyActual += filterNewsByTypeAndMonthAndLocation(type.id, monthStr, location.id);
                }

                const deviation = calculateDeviation(monthlyPlanned, monthlyActual);
                typeRow.push(monthlyPlanned, monthlyActual, deviation);

                totalDeviation += deviation;
            }

            typeRow.push(totalDeviation);
            tableRows.push(typeRow);

            for (const location of locationData) {
                const locationRow: (string | number)[] = [location.name];
                let locationTotalDeviation = 0;

                for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                    const monthStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;

                    const planned = getPlannedData(type.id, monthStr, location.id);
                    const actual = filterNewsByTypeAndMonthAndLocation(type.id, monthStr, location.id);
                    const deviation = calculateDeviation(planned, actual);

                    locationRow.push(planned, actual, deviation);
                    locationTotalDeviation += deviation;
                }

                locationRow.push(locationTotalDeviation);
                tableRows.push(locationRow);
            }
        }

        return tableRows;
    };

    const tableData = generateTableData();

    const handleDownload = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Данные');
  
      // Установка заголовка с жирным текстом
      worksheet.getCell('A1').value = `Таблица информационной активности ${selectedYear}`;
      worksheet.getCell('A1').font = { bold: true, size: 14 };
  
      // Пустая вторая строка
      worksheet.addRow([]);
  
      // Заголовок таблицы
      const headerRow = ['Наименование', ...months.flatMap(month => [`${month}\nплан`, `${month}\nфакт`, `откло\nнение`]), 'ИТОГ'];
      const headerRowValues = worksheet.addRow(headerRow);
  
      // Применение стилей в заголовке
      headerRowValues.eachCell((cell, colNumber) => {
          cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF808A96' },
          };
          cell.font = {
              color: { argb: 'FFFFFFFF' },
              bold: true,
          };
          cell.alignment = { 
            horizontal: colNumber === 1 ? 'left' : 'center', 
            vertical: 'middle' 
          }; 
      });
  
      // Добавление данных
      tableData.forEach(data => {
          const row = worksheet.addRow(data);
          const firstCellValue = data[0];
  
          // Проверяем, если первая ячейка в строке соответствует name из typeData
          const isBold = typeData.some(type => type.name === firstCellValue);
  
          row.eachCell((cell) => {
              cell.alignment = { horizontal: data[0] === cell.value ? 'left' : 'center' }; // Выровнять
              if (isBold) {
                  cell.font = { bold: true }; // Установить жирный шрифт для всей строки
              }
          });
      });
  
      worksheet.getColumn(1).width = 25; // Установка ширины для 1 столбца
  
      const buffer = await workbook.xlsx.writeBuffer(); // Генерация буфера
  
      // Создание Blob и ссылки для скачивания
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pr-table-${selectedYear}.xlsx`;
  
      // Добавление ссылки на страницу и программный клик для скачивания
      document.body.appendChild(a);
      a.click();
  
      // Удаление ссылки и освобождение URL
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  };

    return (
        <>
            <div
                className={`table-container ${isFullscreen ? 'fullscreen' : ''}`}
                style={{
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
                    <h1>Таблица информационной активности за {selectedYear}</h1>
                    <div className="top-buttons">
                        <button className="arrow" onClick={() => setSelectedYear(selectedYear - 1)}><FontAwesomeIcon icon={faAngleLeft} />{selectedYear - 1}</button>
                        <div className="currentPeriod">{selectedYear}</div>
                        <button className="arrow" onClick={() => setSelectedYear(selectedYear + 1)}>{selectedYear + 1} <FontAwesomeIcon icon={faAngleRight} /></button>
                        <button onClick={handleDownload}>
                          <FontAwesomeIcon icon={faFileExcel} title="Скачать XLS" />
                        </button>
                        <button onClick={toggleFullscreen}>
                          <FontAwesomeIcon icon={faExpandArrowsAlt} title='Полный экран' />
                        </button>
                    </div>
                </div>

                <table className="info-table">
                    <thead>
                        <tr>
                            <th></th>
                            {months.flatMap(month => [
                                <th key={`${month}-planned`}>{`${month} план`}</th>,
                                <th key={`${month}-fact`}>{`${month} факт`}</th>,
                                <th key={`${month}-deviation`}>{`откло нение`}</th>
                            ])}
                            <th>итог</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => {
                            return (
                                <tr key={index}>
                                    {row.map((cell, cellIndex) => {
                                        const isTotalRow = index % (locationData.length + 1) === 0;
                                        let className = isTotalRow ? 'title' : '';

                                        if (cellIndex === row.length - 1) { // Это итоговая ячейка
                                            const totalValue = row[row.length - 1];
                                            className += Number(totalValue) > 0 ? ' plus' : Number(totalValue) < 0 ? ' minus' : '';
                                        }

                                        return (
                                            <td
                                                key={cellIndex}
                                                className={className.trim()} // Убираем лишние пробелы
                                            >
                                                {cell}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Table;
