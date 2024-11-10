import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CustomModal from '../components/CustomModal';
import { fetchData } from '../api';
import { useUserContext } from '../components/UserContext';

interface FormData {
  id: string;
  location: number;
  publicationdate: string;
  title: string;
  source: number;
  link: string;
  type: number;
  theme: number;
  emotional: number;
}

interface OptionData {
  id: number;
  name: string;
}

const AddNews: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, pass } = useUserContext();

  const initialFormData: FormData = useMemo(() => ({
    id: '',
    location: 0,
    publicationdate: new Date().toISOString().split('T')[0],
    title: '',
    source: 0,
    link: '',
    type: 0,
    theme: 0,
    emotional: 0,
  }), []);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [inputValues, setInputValues] = useState<{ id: number; name: string }[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [locationData, setLocationData] = useState<OptionData[]>([]);
  const [sourceData, setSourceData] = useState<OptionData[]>([]);
  const [typeData, setTypeData] = useState<OptionData[]>([]);
  const [themeData, setThemeData] = useState<OptionData[]>([]);
  const [emotionalData, setEmotionalData] = useState<OptionData[]>([]);

  useEffect(() => {
    fetchLocationData();
    fetchSourceData();
    fetchTypeData();
    fetchThemeData();
    fetchEmotionalData();
    
    if (id) {
      fetchNewsData();
    }
  }, [id]);

  const loadData = async (url: string, method: string, data: any = null): Promise<any> => {
    const payload = { ...data, adminName: user, adminPass: pass };
    return await fetchData(url, method, payload);
  };

  const fetchLocationData = async () => {
    const data: OptionData[] = await loadData('/api/location/list', 'POST', null);
    setLocationData(data);
  };

  const fetchSourceData = async () => {
    const data: OptionData[] = await loadData('/api/source/list', 'POST', null);
    setSourceData(data);
  };

  const fetchTypeData = async () => {
    const data: OptionData[] = await loadData('/api/type/list', 'POST', null);
    setTypeData(data);
  };

  const fetchThemeData = async () => {
    const data: OptionData[] = await loadData('/api/theme/list', 'POST', null);
    setThemeData(data);
  };

  const fetchEmotionalData = async () => {
    const data: OptionData[] = await loadData('/api/emotional/list', 'POST', null);
    setEmotionalData(data);
  };

  const fetchNewsData = async () => {
    const data: FormData = await fetchData(`/api/news/${id}`, 'POST', {id, adminName: user, adminPass: pass});
    setFormData(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newsToUpdate = {
      id: formData.id || undefined,
      location: formData.location,
      publicationdate: formData.publicationdate,
      title: formData.title,
      source: formData.source,
      link: formData.link,
      type: formData.type,
      theme: formData.theme,
      emotional: formData.emotional,
    };

    if (formData.id) {
      await loadData(`/api/news/update/${formData.id}`, 'PUT', newsToUpdate);
    } else {
      await loadData('/api/news/add', 'POST', newsToUpdate);
    }

    const searchParams = new URLSearchParams(location.search).toString();
    navigate(`/news?${searchParams}#news-${id}`);
  };

  const openModal = (field: string, label: string, data: OptionData[]) => {
    setCurrentField(field);
    setInputValues(data.map(item => ({ id: item.id, name: item.name })));
    setModalIsOpen(true);
    setModalTitle(label);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (index: number, value: string) => {
    const updatedValues = [...inputValues];
    updatedValues[index].name = value;
    setInputValues(updatedValues);
  };

  const addInputField = () => {
    const newId = inputValues.length > 0 ? Math.max(...inputValues.map(item => item.id)) + 1 : 1;
    setInputValues(prev => [...prev, { id: newId, name: '' }]);
  };

  const saveChanges = async () => {
    const updatedValues = inputValues.filter(item => item.name.trim() !== '');
    if (currentField === 'location') {
      await loadData('/api/location/edit', 'POST', {values: updatedValues});
    } else if (currentField === 'source') {
      await loadData('/api/source/edit', 'POST', {values: updatedValues});
    } else if (currentField === 'type') {
      await loadData('/api/type/edit', 'POST', {values: updatedValues});
    } else if (currentField === 'theme') {
      await loadData('/api/theme/edit', 'POST', {values: updatedValues});
    } else if (currentField === 'emotional') {
      await loadData('/api/emotional/edit', 'POST', {values: updatedValues});
    }

    closeModal();
    // Обновление данных после добавления
    fetchLocationData();
    fetchSourceData();
    fetchTypeData();
    fetchThemeData();
    fetchEmotionalData();
  };

  
  return (
    <div className="center">
      <h1>{id ? 'Редактировать новость' : 'Добавить новость'}</h1>
      <form className="form news-form" onSubmit={handleSubmit}>
        <div>
          <label>Территория размещения</label>
          <div className="select-button-group">
            <select name="location" value={formData.location} onChange={handleChange} required>
              <option value="">Выберите территорию</option>
              {locationData.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => openModal('location', 'Территория размещения', locationData)}>+</button>
          </div>
        </div>

        <div>
          <label>Дата публикации</label>
          <input 
            type="date" 
            name="publicationdate" 
            value={formData.publicationdate} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label>Заголовок</label>
          <textarea 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required
          />
        </div>

        <div>
          <label>Источник</label>
          <div className="select-button-group">
            <select name="source" value={formData.source} onChange={handleChange} required>
              <option value="">Выберите источник</option>
              {sourceData.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => openModal('source', 'Источник', sourceData)}>+</button>
          </div>
        </div>

        <div>
          <label>Ссылка</label>
          <input 
            type="url" 
            name="link" 
            value={formData.link} 
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Вид размещения</label>
          <div className="select-button-group">
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Выберите вид размещения</option>
              {typeData.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => openModal('type', 'Вид размещения', typeData)}>+</button>
          </div>
        </div>

        <div>
          <label>Тема</label>
          <div className="select-button-group">
            <select name="theme" value={formData.theme} onChange={handleChange} required>
              <option value="">Выберите тему</option>
              {themeData.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => openModal('theme', 'Тема', themeData)}>+</button>
          </div>
        </div>

        <div>
          <label>Эмоциональный окрас</label>
          <div className="select-button-group">
            <select name="emotional" value={formData.emotional} onChange={handleChange} required>
              <option value="">Выберите эмоциональный окрас</option>
              {emotionalData.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => openModal('emotional', 'Эмоциональный окрас', emotionalData)}>+</button>
          </div>
        </div>

        <div>
          <button type="submit">Сохранить</button>
        </div>
      </form>

      <CustomModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        title={modalTitle}
        inputValues={inputValues.map(item => item.name)}
        onInputChange={handleInputChange}
        onAddInput={addInputField}
        onSave={saveChanges}
      />
    </div>
  );
};

export default AddNews;
