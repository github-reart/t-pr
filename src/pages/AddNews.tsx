import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { locationData, sourceData, typeData, themeData, emotionalData, newsData } from '../data';
import CustomModal from '../components/CustomModal';

interface FormData {
  id: string;
  location: number;
  publicationDate: string;
  title: string;
  source: number;
  link: string;
  type: number;
  theme: number;
  emotional: number;
}

const AddNews: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const initialFormData: FormData = useMemo(() => ({
    id: '',
    location: 0,
    publicationDate: new Date().toISOString().split('T')[0],  // Устанавливаем текущую дату по умолчанию
    title: '',
    source: 0,
    link: '',
    type: 0,
    theme: 0,
    emotional: 0
  }), []); 

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');

  useEffect(() => {
    if (id) {
      const newsItem = newsData.find((item) => item.id.toString() === id);
      if (newsItem) {
        setFormData({
          ...newsItem,
          id: newsItem.id.toString()
        });
      }
    } else {
      setFormData(initialFormData); // сброс формы при добавлении
    }
  }, [id, initialFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const maxId = newsData.length > 0 ? Math.max(...newsData.map(item => item.id)) : 0;

    newsData.push({
      id: maxId + 1,
      location: formData.location,
      publicationDate: formData.publicationDate,
      title: formData.title,
      source: formData.source,
      link: formData.link,
      type: formData.type,
      theme: formData.theme,
      emotional: formData.emotional
    });

    console.log("Данные формы отправлены: ", formData);
    navigate('/news');
  };

  const openModal = (field: string, label: string, data: string[]) => {
    setCurrentField(field);
    setInputValues(data.slice());
    setModalIsOpen(true);
    setModalTitle(label);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (index: number, value: string) => {
    const updatedValues = [...inputValues];
    updatedValues[index] = value;
    setInputValues(updatedValues);
  };

  const addInputField = () => {
    setInputValues(prev => [...prev, '']);
  };

  const saveChanges = () => {
    const updatedValues = inputValues.filter(item => item.trim() !== '');

    if (currentField === 'location') {
      locationData.splice(0, locationData.length, ...updatedValues.map((name, index) => ({ id: index + 1, name })));
    } else if (currentField === 'source') {
      sourceData.splice(0, sourceData.length, ...updatedValues.map((name, index) => ({ id: index + 1, name })));
    } else if (currentField === 'type') {
      typeData.splice(0, typeData.length, ...updatedValues.map((name, index) => ({ id: index + 1, name })));
    } else if (currentField === 'theme') {
      themeData.splice(0, themeData.length, ...updatedValues.map((name, index) => ({ id: index + 1, name })));
    } else if (currentField === 'emotional') {
      emotionalData.splice(0, emotionalData.length, ...updatedValues.map((name, index) => ({ id: index + 1, name })));
    }

    closeModal();
  };

  return (
    <div className="center">
      <h1>{id ? 'Редактировать новость' : 'Добавить новость'}</h1>
      <form className="form" onSubmit={handleSubmit}>
        
        <div>
          <label>Территория размещения</label>
          <div className="select-button-group">
            <select name="location" value={formData.location} onChange={handleChange} required>
              <option value="">Выберите территорию</option>
              {locationData.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => openModal('location', 'Территория размещения', locationData.map(item => item.name))}>+</button>
          </div>
        </div>

        <div>
          <label>Дата публикации</label>
          <input 
            type="date" 
            name="publicationDate" 
            value={formData.publicationDate} 
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
            <button type="button" onClick={() => openModal('source', 'Источник', sourceData.map(item => item.name))}>+</button>
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
            <button type="button" onClick={() => openModal('type', 'Вид размещения', typeData.map(item => item.name))}>+</button>
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
            <button type="button" onClick={() => openModal('theme', 'Тема', themeData.map(item => item.name))}>+</button>
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
            <button type="button" onClick={() => openModal('emotional', 'Эмоциональный окрас', emotionalData.map(item => item.name))}>+</button>
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
        inputValues={inputValues}
        onInputChange={handleInputChange}
        onAddInput={addInputField}
        onSave={saveChanges}
      />
    </div>
  );
};

export default AddNews;
