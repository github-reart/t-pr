import React, { useState } from 'react';
import CustomModal from '../components/CustomModal';
import { locationData, typeData, plannedData } from '../data';

interface FormData {
  location: string;
  type: string;
  month: string;
  planned: string;
}

const Planned: React.FC = () => {

  const getCurrentMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    return `${year}-${month}`;
  };

  const [formData, setFormData] = useState<FormData>({
    location: '',
    type: '',
    month: getCurrentMonth(),
    planned: ''
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Данные формы отправлены: ", formData);

    // Добавляем запись в массив plannedData
    plannedData.push({
      location: Number(formData.location),
      type: Number(formData.type),
      month: formData.month,
      planned: Number(formData.planned)
    });

    setFormData({ location: '', type: '', month: getCurrentMonth(), planned: '' }); // Обнуляем форму с новым текущим месяцем
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
      locationData.length = 0;
      locationData.push(...updatedValues.map((name, index) => ({ id: index + 1, name })));
    } else if (currentField === 'type') {
      typeData.length = 0;
      typeData.push(...updatedValues.map((name, index) => ({ id: index + 1, name })));
    }

    closeModal();
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
            <button type="button" onClick={() => openModal('location', 'Территория размещения', locationData.map(item => item.name))}>+</button>
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
            <button type="button" onClick={() => openModal('type', 'Вид размещения', typeData.map(item => item.name))}>+</button>
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
        inputValues={inputValues}
        onInputChange={handleInputChange}
        onAddInput={addInputField}
        onSave={saveChanges}
      />
    </div>
  );
};

export default Planned;
