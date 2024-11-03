import React, { useState, useEffect } from 'react';
import CustomModal from '../components/CustomModal';
import { fetchData } from '../api';

interface Location {
  id: number;
  name: string;
}

interface Type {
  id: number;
  name: string;
}

interface PlannedData {
  month: string;
  planned: string;
  location: number;
  type: number;
}

const Planned: React.FC = () => {
  const getCurrentMonth = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [formData, setFormData] = useState<PlannedData>({
    location: 0,
    type: 0,
    month: getCurrentMonth(),
    planned: ''
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [inputValues, setInputValues] = useState<{ id: number; name: string }[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [typeData, setTypeData] = useState<Type[]>([]);

  useEffect(() => {
    fetchLocationData();
    fetchTypeData();
  }, []);

  const fetchLocationData = async () => {
    const data: Location[] = await fetchData('/api/location/list', 'POST', null);
    setLocationData(data);
  };

  const fetchTypeData = async () => {
    const data: Type[] = await fetchData('/api/type/list', 'POST', null);
    setTypeData(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData('/api/planned/add', 'POST', { ...formData });
    // Обнуляем только поле planned
    setFormData(prevData => ({ 
      ...prevData, 
      planned: '' 
    }));
    alert('Плановое значение добавлено');
};

  const openModal = (field: string, label: string, data: { id: number; name: string }[]) => {
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
    updatedValues[index].name = value; // Обновляем только name
    setInputValues(updatedValues);
  };

  const addInputField = () => {
    const newId = inputValues.length > 0 ? Math.max(...inputValues.map(item => item.id)) + 1 : 1; // Новый ID
    setInputValues(prev => [...prev, { id: newId, name: '' }]);
  };

  const saveChanges = async () => {
    const updatedValues = inputValues.filter(item => item.name.trim() !== '');
    if (currentField === 'location') {
      await fetchData('/api/location/clear', 'DELETE', null);
      await fetchData('/api/location/add', 'POST', updatedValues);
    } else if (currentField === 'type') {
      await fetchData('/api/type/clear', 'DELETE', null);
      await fetchData('/api/type/add', 'POST', updatedValues);
    }

    closeModal();
    await fetchLocationData();
    await fetchTypeData();
  };

  return (
    <div className="center">
      <h1>Добавить плановое значение</h1>
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
            <button 
              type="button" 
              onClick={() => openModal('location', 'Территория размещения', locationData)}
            >
              +
            </button>
          </div>
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
            <button 
              type="button" 
              onClick={() => openModal('type', 'Вид размещения', typeData)}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label>Месяц</label>
          <input 
            type="month" 
            name="month" 
            value={formData.month} 
            onChange={handleChange}
            required 
          />
        </div>

        <div>
          <label>Плановое значение</label>
          <input 
            type="number" 
            name="planned" 
            value={formData.planned} 
            onChange={handleChange}
            required
          />
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

export default Planned;
