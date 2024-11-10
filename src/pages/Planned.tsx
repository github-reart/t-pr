import React, { useState, useEffect } from 'react';
import CustomModal from '../components/CustomModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { fetchData } from '../api';
import { useUserContext } from '../components/UserContext';

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

interface PlannedValues {
  month: string;
  planned: number;
  location: number;
  type: number;
}

const Planned: React.FC = () => {
  const { user, pass } = useUserContext();

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

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [inputValues, setInputValues] = useState<{ id: number; name: string }[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [typeData, setTypeData] = useState<Type[]>([]);
  const [plannedData, setPlannedData] = useState<PlannedValues[]>([]);
  
  const [isActive, setIsActive] = useState<boolean>(false);
  
  const currentYear = new Date().getFullYear();  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const getFromDate = (year: number) => `${year}-01-01`;
  const getToDate = (year: number) => `${year}-12-31`;

  const loadData = async (url: string, method: string, data: any = null): Promise<any> => {
    const payload = { ...data, adminName: user, adminPass: pass };
    return await fetchData(url, method, payload);
  };

  const fetchLocationData = async (): Promise<void> => {
    const data: Location[] = await loadData('/api/location/list', 'POST');
    setLocationData(data);
  };

  const fetchTypeData = async (): Promise<void> => {
    const data: Type[] = await loadData('/api/type/list', 'POST');
    setTypeData(data);
  };

  const fetchPlannedData = async (): Promise<void> => {
    const fromDate = getFromDate(selectedYear);
    const toDate = getToDate(selectedYear);
    const data: PlannedValues[] = await loadData('/api/planned', 'POST', { from: fromDate, to: toDate });
    setPlannedData(data);
  };

  useEffect(() => {
    fetchLocationData();
    fetchTypeData();
  }, []);

  useEffect(() => {
    fetchPlannedData();
  }, [selectedYear]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'planned' && value !== '') {
      setIsActive(true);
    }

  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await loadData('/api/planned/add', 'POST', { ...formData });
    setFormData(prevData => ({ 
      ...prevData, 
      planned: '' 
    }));
    
    setIsActive(false);    
    await fetchPlannedData();
  };

  const openModal = (field: string, label: string, data: { id: number; name: string }[]): void => {
    setCurrentField(field);
    setInputValues(data.slice());
    setModalIsOpen(true);
    setModalTitle(label);
  };

  const closeModal = (): void => {
    setModalIsOpen(false);
  };

  const handleInputChange = (index: number, value: string): void => {
    const updatedValues = [...inputValues];
    updatedValues[index].name = value;
    setInputValues(updatedValues);
  };

  const addInputField = (): void => {
    const newId = inputValues.length > 0 ? Math.max(...inputValues.map(item => item.id)) + 1 : 1;
    setInputValues(prev => [...prev, { id: newId, name: '' }]);
  };

  const saveChanges = async (): Promise<void> => {
    const updatedValues = inputValues.filter(item => item.name.trim() !== '');
    if (currentField === 'location') {
      await loadData('/api/location/edit', 'POST', { values: updatedValues });
    } else if (currentField === 'type') {
      await loadData('/api/type/edit', 'POST', { values: updatedValues });
    }

    closeModal();
    await fetchLocationData();
    await fetchTypeData();
  };

  const editPlannedValue = (locationId: number, typeId: number, month: string, planned: number): void => {
    setFormData({
      location: locationId,
      type: typeId,
      month,
      planned: planned.toString()
    });
    
    setIsActive(true);
    const inputElement = document.getElementById('plannedInput') as HTMLInputElement;
    inputElement.focus();
    inputElement.select();
  };

  const deletePlannedValue = async (): Promise<void> => {
    const confirmDelete = window.confirm('Вы действительно хотите удалить это плановое значение?');
    if (confirmDelete) {
      await loadData('/api/planned/del', 'DELETE', { 
        location: formData.location, 
        type: formData.type, 
        month: formData.month 
      });

      setFormData(prevData => ({
        ...prevData,
        planned: ''
      }));

      setIsActive(false);
      await fetchPlannedData();
    }
  };

  return (
    <div className="planned-page">
      <form className="form planned-form" onSubmit={handleSubmit}>
        <div className="container">
          <div className="column">
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

          <div className="column">
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

          <div className="column">
            <label>Месяц</label>
            <input 
              type="month" 
              name="month" 
              value={formData.month} 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="column">
            <label>Плановое значение</label>
            <input 
              id="plannedInput"
              type="number" 
              name="planned" 
              value={formData.planned} 
              onChange={handleChange}
              required
              className={isActive ? 'active' : ''}
            />
          </div>

          <div className="column">
            <button type="submit">сохранить</button>
            <button 
              type="button" 
              className="reset-button" 
              title='удалить плановое значение' 
              onClick={deletePlannedValue}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      </form>

      <div className="header-container">
        <h1>Плановые значения за {selectedYear}</h1>
        <div className="top-buttons">
          <button className="arrow" onClick={() => setSelectedYear(selectedYear - 1)}><FontAwesomeIcon icon={faAngleLeft} />{selectedYear - 1}</button>
          <div className="currentPeriod">{selectedYear}</div>
          <button className="arrow" onClick={() => setSelectedYear(selectedYear + 1)}>{selectedYear + 1} <FontAwesomeIcon icon={faAngleRight} /></button>
        </div>
      </div>

      {typeData.map(type => (
        <div key={type.id}>
          <h2>{type.name}</h2>
          <table className="stat-table planned-table">
            <thead>
              <tr>
                <th>Площадка/число</th>
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</th>
                ))}
                <th>Всего</th>
              </tr>
            </thead>
            <tbody>
              {locationData.map(location => {
                const valuesByMonth = plannedData.filter(item => 
                  item.location === location.id && item.type === type.id);
                
                const plannedValues = Array(12).fill(0);
                valuesByMonth.forEach(item => {
                  const monthIndex = parseInt(item.month.split('-')[1], 10) - 1;
                  plannedValues[monthIndex] = item.planned;
                });
                
                const total = plannedValues.reduce((sum, value) => sum + value, 0);

                return (
                  <tr key={location.id}>
                    <td>{location.name}</td>
                    {plannedValues.map((value, index) => (
                      <td key={index}>
                        <button onClick={() => editPlannedValue(location.id, type.id, `${selectedYear}-${String(index + 1).padStart(2, '0')}`, value)}>
                          {value}
                        </button>
                      </td>
                    ))}
                    <td>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

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
