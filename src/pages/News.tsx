import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faCirclePlus, faCalendarDays, faXmark } from '@fortawesome/free-solid-svg-icons';
import { fetchData } from '../api';
import { useUserContext } from '../components/UserContext';
import Modal from 'react-modal';

interface NewsItem {
  id: number;
  title: string;
  publicationdate: string;
  location: number;
  type: number;
  theme: number;
  emotional: number;
  source: number;
  link?: string;
}

interface LocationData {
  id: number;
  name: string;
}

interface SourceData {
  id: number;
  name: string;
}

interface TypeData {
  id: number;
  name: string;
}

interface ThemeData {
  id: number;
  name: string;
}

interface EmotionalData {
  id: number;
  name: string;
}

const News: React.FC = () => {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [types, setTypes] = useState<TypeData[]>([]);
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [emotions, setEmotions] = useState<EmotionalData[]>([]);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const location = useLocation();

  const { user, pass } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<NewsItem>({
    id: 0,
    title: '',
    publicationdate: '',
    location: 0,
    type: 0,
    theme: 0,
    emotional: 0,
    source: 0,
    link: '',
  });

  const loadLocationData = async () => {
    const data: LocationData[] = await loadData('/api/location/list', 'POST');
    setLocations(data);
  };

  const loadSourceData = async () => {
    const data: SourceData[] = await loadData('/api/source/list', 'POST');
    setSources(data);
  };

  const loadTypeData = async () => {
    const data: TypeData[] = await loadData('/api/type/list', 'POST');
    setTypes(data);
  };

  const loadThemeData = async () => {
    const data: ThemeData[] = await loadData('/api/theme/list', 'POST');
    setThemes(data);
  };

  const loadEmotionalData = async () => {
    const data: EmotionalData[] = await loadData('/api/emotional/list', 'POST');
    setEmotions(data);
  };

  const getLocationName = (id: number) => locations.find(location => location.id === id)?.name || '';
  const getSourceName = (id: number) => sources.find(source => source.id === id)?.name || '';
  const getTypeName = (id: number) => types.find(type => type.id === id)?.name || '';
  const getThemeName = (id: number) => themes.find(theme => theme.id === id)?.name || '';
  const getEmotionalName = (id: number) => emotions.find(tone => tone.id === id)?.name || '';

  const deleteNews = async (id: number) => {
    const confirmed = window.confirm("Вы уверены, что хотите удалить эту новость?");
    if (!confirmed) return;

    try {
      await loadData('/api/news/del', 'DELETE', { id });
      setFilteredNews(filteredNews.filter(news => news.id !== id));
      setAllNews(allNews.filter(news => news.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении новости:", error);
    }
  };

  const handleEditClick = (newsItem: NewsItem) => {
    setFormData(newsItem);
    setIsModalOpen(true);
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

  const handleShowClick = async () => {
    updateUrl(locationId, fromDate, toDate);
    loadNewsData(fromDate, toDate, locationId);
  };

  const handleResetClick = () => {
    setLocationId(undefined);
    setFromDate('');
    setToDate('');
    const today = new Date();
    const lastThreeMonths = new Date(today);
    lastThreeMonths.setMonth(today.getMonth() - 3);
    setFromDate(lastThreeMonths.toISOString().split('T')[0]);
    window.history.pushState({}, '', '/news');
    loadNewsData(lastThreeMonths.toISOString().split('T')[0], '');
    filterNews();
  };

  const loadData = async (url: string, method: string, data: any = null): Promise<any> => {
    const payload = { ...data, adminName: user, adminPass: pass };
    return await fetchData(url, method, payload);
  };

  const loadNewsData = async (from: string, to: string, locationId?: number) => {
    const data: NewsItem[] = await loadData('/api/news', 'POST', { from, to });
    setAllNews(data);
    const filtered = data.filter(news => {
      const isInLocation = locationId ? news.location === locationId : true;
      return isInLocation;
    });
    setFilteredNews(filtered);
  };

  const filterNews = (locId?: number, from?: string, to?: string) => {
    const filtered = allNews.filter(news => {
      const isInLocation = locId ? news.location === locId : true;
      return isInLocation;
    });
    setFilteredNews(filtered);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({
      id: 0,
      title: '',
      publicationdate: '',
      location: 0,
      type: 0,
      theme: 0,
      emotional: 0,
      source: 0,
      link: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'location' || name === 'type' || name === 'theme' || name === 'emotional' || name === 'source' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    const newsToUpdate = { ...formData };
    await loadData(`/api/news/update/${formData.id}`, 'PUT', newsToUpdate);
    loadNewsData(fromDate, toDate, locationId);
    handleModalClose();
  };

  useEffect(() => {
    loadLocationData();
    loadSourceData();
    loadTypeData();
    loadThemeData();
    loadEmotionalData();

    const today = new Date();
    const lastThreeMonths = new Date(today);
    lastThreeMonths.setMonth(today.getMonth() - 3);
    setFromDate(lastThreeMonths.toISOString().split('T')[0]);

    const queryParams = new URLSearchParams(location.search);
    const fromQuery = queryParams.get('from');
    const toQuery = queryParams.get('to');
    const locationQuery = queryParams.get('l');

    if (fromQuery) {
      setFromDate(fromQuery);
    }
    if (toQuery) {
      setToDate(toQuery);
    }
    if (locationQuery) {
      const locId = Number(locationQuery);
      setLocationId(locId);
    }

    if (fromQuery || toQuery || locationQuery) {
      loadNewsData(fromQuery ?? '', toQuery ?? '', Number(locationQuery) ?? '');
    } else {
      loadNewsData(lastThreeMonths.toISOString().split('T')[0], '');
    }

  }, []);

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
        <h1>Новости ({filteredNews.length})</h1>
        <div className="top-buttons">
          <select onChange={handleLocationChange} value={locationId || '0'}>
            <option value="0">Все территории</option>
            {locations.map(location => (
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
          <button className="reset-button" onClick={handleResetClick}><FontAwesomeIcon icon={faXmark} /> сброс</button>
          <Link to="/add-news" className="add-news-button">
            <button>
              <FontAwesomeIcon icon={faCirclePlus} /> Добавить новость
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
              <button onClick={() => handleEditClick(news)}>
                <FontAwesomeIcon icon={faPencilAlt} />
              </button>
              <button onClick={() => deleteNews(news.id)}>
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </div>
          <div className="news-subheader">{news.publicationdate} | {getEmotionalName(Number(news.emotional))}</div>
          <div className="news-title">{news.title}</div>
          <div className="news-source">
            {getSourceName(Number(news.source))} {news.link && <a href={news.link} target="_blank" rel="noopener noreferrer">{news.link}</a>}
          </div>
        </div>
      ))}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        className="modal"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <button className="modal-close" onClick={handleModalClose}>✖</button>
        <h2>Редактирование новости</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>

          <div className="container">
            <div className="column">
              <select name="location" value={formData.location} onChange={handleChange} required>
                <option value="">Выберите территорию</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>            
            </div>          
            <div className="column">
              <input 
                type="date" 
                name="publicationdate" 
                value={formData.publicationdate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <textarea 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            placeholder="Введите заголовок"
          />

          <select name="source" value={formData.source} onChange={handleChange} required>
            <option value="">Выберите источник</option>
            {sources.map(source => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>

          <input 
            type="text" 
            name="link" 
            value={formData.link} 
            onChange={handleChange} 
            placeholder="Ссылка" 
          />
                    
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="">Выберите вид размещения</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
                    
          <select name="theme" value={formData.theme} onChange={handleChange} required>
            <option value="">Выберите тему</option>
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
          
          <select name="emotional" value={formData.emotional} onChange={handleChange} required>
            <option value="">Выберите эмоциональный окрас</option>
            {emotions.map(emotional => (
              <option key={emotional.id} value={emotional.id}>
                {emotional.name}
              </option>
            ))}
          </select>
          
          <button type="submit">Сохранить</button>
        </form>
      </Modal>
    </div>
  );
};

export default News;
