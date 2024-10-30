import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faPlus, faCalendarDays, faXmark } from '@fortawesome/free-solid-svg-icons';
import { newsData, locationData, sourceData, typeData, themeData, emotionalData } from '../data';

interface NewsItem {
  id: number;
  title: string;
  publicationDate: string;
  location: number;
  type: number;
  theme: number;
  emotional: number;
  source: number;
  link?: string;
}

const News: React.FC = () => {
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>(newsData);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const today = new Date();
    const lastThreeMonths = new Date(today);
    lastThreeMonths.setMonth(today.getMonth() - 3);

    setFromDate(lastThreeMonths.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const fromQuery = queryParams.get('from');
  const toQuery = queryParams.get('to');
  const locationQuery = queryParams.get('l');

  useEffect(() => {
    if (fromQuery) {
      setFromDate(fromQuery);
    }
    if (toQuery) {
      setToDate(toQuery);
    }
    if (locationQuery) {
      setLocationId(Number(locationQuery));
    }
  }, [locationQuery, fromQuery, toQuery]);

  const getLocationName = (id: number) => locationData.find(location => location.id === id)?.name || '';
  const getSourceName = (id: number) => sourceData.find(source => source.id === id)?.name || '';
  const getTypeName = (id: number) => typeData.find(type => type.id === id)?.name || '';
  const getThemeName = (id: number) => themeData.find(theme => theme.id === id)?.name || '';
  const getEmotionalName = (id: number) => emotionalData.find(tone => tone.id === id)?.name || '';

  const handleEditClick = (id: number) => {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.search;
    return `/add-news/${id}${searchParams}`;
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocationId = event.target.value;
    const newLocationId = selectedLocationId ? Number(selectedLocationId) : undefined;

    setLocationId(newLocationId); 
    updateUrl(newLocationId, fromDate, toDate);
    filterNews(newLocationId, fromDate, toDate);
  };

  const updateUrl = (selectedLocationId?: number, from?: string, to?: string) => {
    const newUrl = new URL(window.location.href);
    if (selectedLocationId !== undefined) newUrl.searchParams.set('l', selectedLocationId.toString());
    if (from) newUrl.searchParams.set('from', from);
    if (to) newUrl.searchParams.set('to', to);
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(event.target.value);
  };

  const handleToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(event.target.value);
  };

  const handleShowClick = () => {
    updateUrl(locationId, fromDate, toDate);
    filterNews(locationId, fromDate, toDate);
  };

  const handleResetClick = () => {
    setLocationId(undefined);
    setFromDate('');
    setToDate('');
    const today = new Date();
    const lastThreeMonths = new Date(today);
    lastThreeMonths.setMonth(today.getMonth() - 3);
    setFromDate(lastThreeMonths.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
    window.history.pushState({}, '', '/news');
    filterNews();
  };

  const filterNews = (locId?: number, from?: string, to?: string) => {
    const today = new Date();
    const lastThreeMonths = new Date(today);
    lastThreeMonths.setMonth(today.getMonth() - 3);

    const filtered = newsData.filter(news => {
      const publicationDate = new Date(news.publicationDate);
      const isInLocation = locId ? news.location === locId : true;
      const isAfterFromDate = from ? publicationDate >= new Date(from) : publicationDate >= lastThreeMonths;
      const isBeforeToDate = to ? publicationDate <= new Date(to) : publicationDate <= today;

      return isInLocation && isAfterFromDate && isBeforeToDate;
    });

    setFilteredNews(filtered);
  };

  useEffect(() => {
    filterNews(Number(locationQuery), fromQuery || '', toQuery || '');
  }, [locationQuery, fromQuery, toQuery]);

  useEffect(() => {
    const anchor = window.location.hash;
    if (anchor) {
      const element = document.querySelector(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [filteredNews]);

  return (
    <div>
      <div className="header-container">
        <h1>Новости</h1>
        <div className="top-buttons">
          <select onChange={handleLocationChange} value={locationId || '0'}>
            <option value="0">Все территории</option>
            {locationData.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromChange}
            placeholder="От"
          />
           —
          <input
            type="date"
            value={toDate}
            onChange={handleToChange}
            placeholder="До"
          />
          <button className="calendar-button" onClick={handleShowClick}><FontAwesomeIcon icon={faCalendarDays} /> показать</button>
          <button className="reset-button" onClick={handleResetClick}><FontAwesomeIcon icon={faXmark} />сброс</button>
          <Link to="/add-news" className="add-news-button">
            <button>
              <FontAwesomeIcon icon={faPlus} /> Добавить новость
            </button>
          </Link>
        </div>
      </div>
      {filteredNews.map((news) => (
        <div key={news.id} id={`news-${news.id}`} className="news-block">
          <div className="news-header">
            <div>
              <span className={`badge badge-location`}>{getLocationName(Number(news.location))}</span>
              <span className={`badge badge-type`}>{getTypeName(Number(news.type))}</span>
              <span className={`badge badge-theme`}>{getThemeName(Number(news.theme))}</span>
            </div>
            <div className="edit-button">
              <Link to={handleEditClick(news.id)}>
                <button>
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
              </Link>
              <button>
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </div>
          <div className="news-subheader">{news.publicationDate} | {getEmotionalName(Number(news.emotional))}</div>
          <div className="news-title">{news.title}</div>
          <div className="news-source">
            {getSourceName(Number(news.source))} {news.link && <a href={news.link} target="_blank" rel="noopener noreferrer">{news.link}</a>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default News;
