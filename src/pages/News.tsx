import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { newsData, locationData, sourceData, typeData, themeData, emotionalData } from '../data';

const News: React.FC = () => {
  const getLocationName = (id: number) => locationData.find(location => location.id === id)?.name || '';
  const getSourceName = (id: number) => sourceData.find(source => source.id === id)?.name || '';
  const getTypeName = (id: number) => typeData.find(type => type.id === id)?.name || '';
  const getThemeName = (id: number) => themeData.find(theme => theme.id === id)?.name || '';
  const getEmotionalName = (id: number) => emotionalData.find(tone => tone.id === id)?.name || '';

  const sortedNewsData = newsData.sort((a, b) => {
    const dateA = new Date(a.publicationDate).getTime();
    const dateB = new Date(b.publicationDate).getTime();

    if (dateA === dateB) {
      return b.id - a.id; // Более высокий id выше
    }
    return dateB - dateA; // Более новая дата выше
  });

  return (
    <div>
      <div className="header-container">
        <h1>Новости</h1>
        <Link to="/add-news" className="add-news-button">
          <button>
            <FontAwesomeIcon icon={faPlus} /> Добавить новость
          </button>
        </Link>
      </div>
      {sortedNewsData.map((news) => (
        <div key={news.id} className="news-block">
          <div className="news-header">
            <div>
              <span className={`badge badge-location`}>{getLocationName(Number(news.location))}</span>
              <span className={`badge badge-type`}>{getTypeName(Number(news.type))}</span>
              <span className={`badge badge-theme`}>{getThemeName(Number(news.theme))}</span>
            </div>
            <div className="edit-button">
              <Link to={`/add-news/${news.id}`}>
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
