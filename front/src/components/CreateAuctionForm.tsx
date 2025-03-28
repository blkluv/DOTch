import React, { useState } from 'react';
import styles from '../styles/CreateAuctionForm.module.css';

interface CreateAuctionFormProps {
  onClose: () => void;
}

const CreateAuctionForm: React.FC<CreateAuctionFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tokenAddress: '',
    startTime: '',
    duration: '',
    startPrice: '',
    minPrice: '',
    totalTokens: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.tokenAddress)) errors.tokenAddress = 'Invalid token address';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    
    const duration = Number(formData.duration);
    if (isNaN(duration) || duration <= 0) errors.duration = 'Duration must be a positive number';

    const startPrice = Number(formData.startPrice);
    if (isNaN(startPrice) || startPrice <= 0) errors.startPrice = 'Starting price must be a positive number';

    const minPrice = Number(formData.minPrice);
    if (isNaN(minPrice) || minPrice <= 0) errors.minPrice = 'Minimum price must be a positive number';

    const totalTokens = Number(formData.totalTokens);
    if (isNaN(totalTokens) || totalTokens <= 0) errors.totalTokens = 'Total tokens must be a positive number';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Here you would typically make an API call to your backend
        // For now, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSuccess(true);
      } catch (error) {
        console.error('Failed to create auction:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Create New Auction</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {[
            { label: 'Auction Name', name: 'name', type: 'text' },
            { label: 'Description', name: 'description', type: 'textarea' },
            { label: 'Token Address', name: 'tokenAddress', type: 'text', placeholder: '0x...' },
            { label: 'Start Time', name: 'startTime', type: 'datetime-local' },
            { label: 'Duration (days)', name: 'duration', type: 'number', min: '1', step: '1' },
            { label: 'Starting Price (DOT)', name: 'startPrice', type: 'number', step: '0.0000000001', min: '0' },
            { label: 'Minimum Price (DOT)', name: 'minPrice', type: 'number', step: '0.0000000001', min: '0' },
            { label: 'Total Tokens', name: 'totalTokens', type: 'number', step: '1', min: '1' }
          ].map(({ label, name, type, ...rest }) => (
            <div key={name} className={styles.formGroup}>
              <label htmlFor={name}>{label}</label>
              {type === 'textarea' ? (
                <textarea 
                  id={name} 
                  name={name} 
                  value={formData[name as keyof typeof formData]} 
                  onChange={handleChange} 
                  required 
                />
              ) : (
                <input 
                  id={name} 
                  name={name} 
                  type={type} 
                  value={formData[name as keyof typeof formData]} 
                  onChange={handleChange} 
                  required 
                  {...rest} 
                />
              )}
              {formErrors[name as keyof typeof formErrors] && (
                <span className={styles.error}>
                  {formErrors[name as keyof typeof formErrors]}
                </span>
              )}
            </div>
          ))}

          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isSubmitting || Object.keys(formErrors).length > 0}
          >
            {isSubmitting ? 'Creating...' : 'Create Auction'}
          </button>
        </form>

        {isSuccess && (
          <div className={styles.success}>
            Auction created successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAuctionForm;
