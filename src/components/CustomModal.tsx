import React from 'react';
import Modal from 'react-modal';

interface CustomModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  inputValues: string[];
  onInputChange: (index: number, value: string) => void;
  onAddInput: () => void;
  onSave: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onRequestClose,
  title,
  inputValues,
  onInputChange,
  onAddInput,
  onSave,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <button className="modal-close" onClick={onRequestClose}>✖</button>
      <h2>{title}</h2>
      {inputValues.map((value, index) => (
        <input key={index}
               value={value}
               onChange={e => onInputChange(index, e.target.value)}
               placeholder="Введите значение" />
      ))}
      <button className="add-input-button" onClick={onAddInput}>+ Добавить поле</button>
      <button className="save-button" onClick={onSave}>Сохранить значения</button>
    </Modal>
  );
};

export default CustomModal;
