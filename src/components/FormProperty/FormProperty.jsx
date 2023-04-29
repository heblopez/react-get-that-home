import React, { useCallback, useState } from 'react';
import {
  createProperty,
  updateProperty,
} from '../../services/properties-services';
import Button from '../../components/Button/Button';
import { Form, Formik } from 'formik';
import Field from '../../components/Inputs/Formik/Input';
import InputCR from '../../components/Inputs/Formik/InputCR';
import Select from '../../components/Inputs/Formik/Select';
import { useProp } from '../../context/PropertyContext';
import WrapperForm from './FormProperty-UI';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineUpload } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

const FormProperty = ({ valuesProp, location, id }) => {
  const navigate = useNavigate();
  const { rentOrSale } = useProp();
  const [photos, setPhotos] = useState([]);

  const handleUpload = (value) => {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    for (const key in value) {
      formData.append(key, value[key]);
    }
    location === '/new_property'
      ? createProperty(formData)
      : updateProperty(formData, id);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setPhotos([...photos, ...files]);
  };

  const handleDelete = useCallback((photo) => {
  setPhotos(photos.filter((p) => p !== photo));
}, [photos]);

  const validates = Yup.object({
    address: Yup.string().required('Enter the address'),
    monthly_rent:
      rentOrSale === 'rent' &&
      Yup.number().positive().required('Monthly rent is a required'),
    maintanance:
      rentOrSale === 'rent' && Yup.number().positive().required('Required'),
    price:
      rentOrSale === 'sale' && Yup.number().positive().required('Required'),
    type_property: Yup.boolean(),
    bedrooms: Yup.number().positive().required('Is required'),
    bathrooms: Yup.number().positive().required('Is required'),
    area: Yup.number().positive().required('Is required'),
    pets_allowed: Yup.boolean(),
    description: Yup.string()
      .min(15, 'Must to be 15 characters or greater')
      .required(),
  });

  return (
    <WrapperForm>
      <Formik
        initialValues={valuesProp}
        validationSchema={validates}
        onSubmit={(values) => {
          setTimeout(() => {
            const data = {
              address: values.address,
              type_operation: rentOrSale,
              monthly_rent: values.monthly_rent,
              maintanance: values.maintanance,
              price: values.price,
              type_property: values.house
                ? 'house'
                : values.apartment
                ? 'apartment'
                : null,
              bedrooms: values.bedrooms,
              bathrooms: values.bathrooms,
              area: values.area,
              pets_allowed: values.pets_allowed,
              description: values.description,
            };

            handleUpload(data);
            navigate('/my_properties');
          }, 100);
        }}
      >
        {({ isValid }) => (
          <Form>
            <div className='form-create'>
              <Field
                name='address'
                label='Address'
                type='text'
                placeholder={'start typing to autocomplete'}
              >
                <FiSearch />
              </Field>
              {rentOrSale === 'rent' ? (
                <>
                  <div className='montly-rent'>
                    <Field
                      name='monthly_rent'
                      label='Monthly rent'
                      type='number'
                      placeholder='2000'
                    >
                      <HiOutlineCurrencyDollar />
                    </Field>
                  </div>
                  <div className='maintance'>
                    <Field
                      name='maintanance'
                      label='Maintanance'
                      type='number'
                      placeholder='100'
                    >
                      <HiOutlineCurrencyDollar />
                    </Field>
                  </div>
                </>
              ) : (
                <div className='price'>
                  <Field
                    name='price'
                    label='Price'
                    type='number'
                    placeholder='100'
                  >
                    <HiOutlineCurrencyDollar />
                  </Field>
                </div>
              )}
              <div className='property-type'>
                <label className='label--property-type'>Property Type</label>
                <div className='checkboxes'>
                  <InputCR type='checkbox' id='apartment' name='apartment'>
                    Apartment
                  </InputCR>
                  <InputCR type='checkbox' id='house' name='house'>
                    House
                  </InputCR>
                </div>
              </div>

              <div className='services'>
                <div className='services--inputs'>
                  <div className='select'>
                    <Select name='bedrooms' label='Bedrooms'>
                      <option>Select...</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </Select>
                  </div>
                  <div className='select'>
                    <Select name='bathrooms' label='Bathrooms'>
                      <option>Select...</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </Select>
                  </div>
                  <div className='select'>
                    <Field
                      name='area'
                      label='Area in m2'
                      type='number'
                      placeholder='##'
                    />
                  </div>
                </div>
              </div>

              <div className='list-check__text'>
                <div className='check-text'>
                  <InputCR
                    type='checkbox'
                    id='pets_allowed'
                    name='pets_allowed'
                  >
                    Pets Allowed
                  </InputCR>
                  <small className='small'>
                    Allowing pets increases the likehood of renters liking the
                    property by 9001%. It also makes you a better person.
                  </small>
                </div>
                <div className='check-text'>
                  <Field
                    label={'About this property'}
                    name='description'
                    as='textarea'
                    placeholder='My apartment is great because...'
                  />
                  <small>
                    Renters will read this first, so highlight any features or
                    important information the apartment has.
                  </small>
                </div>
              </div>

              <div className='charge-photo'>
                <p className='title-photo'>Photos</p>
                <p className='upload'>Upload as many photos as you wish</p>
                <div className='input-upload'>
                  <label className='upload' htmlFor='file-upload'>
                    Choose a file
                    <input
                      type='file'
                      id='file-upload'
                      name='file-upload'
                      onChange={handleFileChange}
                      multiple
                    />
                  </label>
                  <label htmlFor='file-upload' className='file-no'>
                    No file chosen
                  </label>
                  <div className='icon-upload'>
                    <AiOutlineUpload />
                  </div>
                  <div className='size-img'>
                    <small className='size-max'>Only images, max 5MB</small>
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  {photos?.map((photo) => (
                    <div key={photo.name}>
                      <img
                        style={{
                          width: '300px',
                          height: '200px',
                          objectFit: 'cover',
                          padding: '8px',
                        }}
                        src={URL.createObjectURL(photo)}
                        alt={photo.name}
                      />
                      <div
                        style={{ marginTop: '30px' }}
                        onClick={() => handleDelete(photo)}
                      >
                        <Button type='' typeBtn='button' size='sm'>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='btn-create__property'>
                <Button
                  type={'primary'}
                  typeBtn={'submit'}
                  size={'lg'}
                  disabled={!isValid}
                >
                  Publish Property Listing
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </WrapperForm>
  );
};

export default FormProperty;
