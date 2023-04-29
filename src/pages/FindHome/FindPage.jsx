import React, { useCallback, useMemo, useState } from 'react';
import Button from '../../components/Button/Button';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { SectionFind, BarOption } from './FilterOptions-UI';
import More from '../../modals/More/More';
import Input from '../../components/Inputs/Input/Input';
import { createPortal } from 'react-dom';
import Property from '../../modals/Property/Property';
import Price from '../../modals/Price/Price';
import { BedBath } from '../../modals/BedBath/BedBath';
import BuyOrRent from '../../modals/BuyOrRent/BuyOrRent';
import Card from '../../components/Card/Card';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useProp } from '../../context/PropertyContext';
import NotFound from '../../components/NoFound/NotFound';

//filter by address
function filterByAddress(properties, address) {
  if (address === '') return properties;
  const byAddress = properties?.filter(
    (prop) => prop.address.toLowerCase().includes(address.toLowerCase()) && prop
  );

  return byAddress;
}

// filter by price
function filterByPrice(properties, price) {
  const { min, max } = price;

  const byPrice = properties?.filter((prop) => {
    const isMin = prop.price >= min || min === 0;
    const isMax = prop.price <= max || max === Infinity;
    return isMin && isMax && prop;
  });

  return byPrice;
}

// filter by type property
function filterByTypeProperty(properties, type_property) {
  const { house, apartment } = type_property;

  if (!house && !apartment) return properties;

  const byTypeProp = properties.filter(
    (prop) =>
      (prop.type_property.toLowerCase() === house && prop) ||
      (prop.type_property.toLowerCase() === apartment && prop)
  );

  return byTypeProp;
}

// filter by services
function filterByServices(properties, services) {
  const { bathrooms, bedrooms } = services;
  if (!bathrooms && !bedrooms) return properties;
  const byServices = properties.filter(
    (prop) =>
      (prop.bathrooms === bathrooms && prop) ||
      (prop.bedrooms === bedrooms && prop)
  );

  return byServices;
}

// filter by area
function filterByArea(properties, area) {
  const { min, max } = area;
  if (!min && !max) return properties;
  const byArea = properties.filter(
    (prop) =>
      (prop.area >= min && prop.area <= max && prop) ||
      (min === 0 && prop.area <= max && prop) ||
      (prop.area >= min && max === Infinity && prop)
  );

  return byArea;
}

// filter by pets allowed
function filterByPetsAllowed(properties, pets) {
  if (!pets) return properties;
  const byPetsAllowed = properties.filter((prop) => prop.pets_allowed && prop);

  return byPetsAllowed;
}

// filter by buying or renting
function filterByBuyingRenting(properties, type_operation) {
  const { both, buying, renting } = type_operation;

  const buy = buying ? 'sale' : '';
  const rent = renting ? 'rent' : '';

  if (both || (!both && !renting && !buying)) {
    return properties;
  }

  const byBoR = properties.filter((prop) =>
    prop.type_operation === buy
      ? prop
      : prop.type_operation === rent
      ? prop
      : null
  );

  return byBoR;
}

// function sort
function sortedBy(properties) {
  const sorted = properties.sort(
    (a, b) => new Date(a.create_at) - new Date(b.create_at)
  );
  return sorted;
}

// filter properties by
function filterProperties(properties, filter) {
  const {
    address,
    price,
    type_property,
    services,
    pets,
    area,
    type_operation,
  } = filter;

  const filteredByAddress = filterByAddress(properties, address);
  const filteredByPrice = filterByPrice(filteredByAddress, price);
  const filteredByTypeProp = filterByTypeProperty(
    filteredByPrice,
    type_property
  );

  const filteredByServices = filterByServices(filteredByTypeProp, services);
  const filteredByPets = filterByPetsAllowed(filteredByServices, pets);
  const filteredByArea = filterByArea(filteredByPets, area);
  const filteredByBoR = filterByBuyingRenting(filteredByArea, type_operation);
  return filteredByBoR;
}

// component Find Properties
const FindPage = () => {
  const { properties, searchBy } = useProp();
  const [showMore, setShowMore] = useState(false);
  const [showBbth, setShowBbth] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showPrice, setShowPrices] = useState(false);
  const [showBuyRent, setShowbuyRent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    address: searchBy.where || '',
    price: { min: 0, max: Infinity },
    type_property: {
      house: searchBy.looking === 'house' ? 'house' : null,
      apartment: searchBy.looking === 'apartment' ? 'apartment' : null,
    },
    services: { bathrooms: null, bedrooms: null },
    pets: false,
    area: { min: 0, max: 999999999 },
    type_operation: {
      both: true,
      buying: searchBy.want === 'buy' ? true : false,
      renting: searchBy.want === 'rent' ? true : false,
    },
  });

  // show modal more
  const handleShowMore = useCallback(() => {
    setShowMore((showMore) => !showMore);
  }, []);

  // show modal beds & bathrooms
  function handleShowBbth() {
    setShowBbth(!showBbth);
  }

  // show modal property type
  function handleShowProperties() {
    setShowProperties(!showProperties);
  }

  // Show modal price
  function handleShowPrices() {
    setShowPrices(!showPrice);
  }

  // show modal buy or rent
  function handleShowbuyRent() {
    setShowbuyRent(!showBuyRent);
  }

  // search by address
  function handleChangeSearch(e) {
    setFilter({
      ...filter,
      address: e.target.value,
    });
  }

  // search by type operation
  function handleChange(e) {
    const name = e.target.name;
    const isChecked = e.target.checked;
    setFilter({
      ...filter,
      type_operation: { ...filter.type_operation, [name]: isChecked },
    });
  }

  // search by price
  function handleGetPrice(data) {
    setFilter({
      ...filter,
      price: {
        ...filter.price,
        min: data.min * 1000,
        max: data.max === 0 ? Infinity : data.max * 1000,
      },
    });
  }

  // search by property
  function handleGetProperty(data) {
    setFilter({
      ...filter,
      type_property: {
        ...filter.type_property,
        house: data.house,
        apartment: data.apartment,
      },
    });
  }

  // search by bathrooms and bedrooms
  function handleGetBB(data) {
    setFilter({
      ...filter,
      services: {
        ...filter.services,
        bathrooms: data.baths,
        bedrooms: data.beds,
      },
    });
  }

  // search by pets allowed or area m^2
  function handleGetMore(data) {
    setFilter({
      ...filter,
      pets: data.pets,
      area: { ...filter.area, min: data.min, max: data.max },
    });
  }

  // sort properties by create at
  const propSorted = useMemo(() => sortedBy(properties), [properties]);

  // properties filtered
  const PropertiesFiltered = filterProperties(propSorted, filter);

  const pageSize = 9;
  const totalPage = Math.ceil(PropertiesFiltered.length / pageSize);

  function goToPage(pageNumber) {
    setCurrentPage(pageNumber);
  }

  function getPage() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return PropertiesFiltered.slice(startIndex, endIndex);
  }

  const currentPageData = getPage();

  function kFormatter(num) {
    if (!num) return;

    return Math.abs(num) > 999
      ? '$' + Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
      : Math.sign(num) * Math.abs(num);
  }

  return (
    <SectionFind>
      <div className='container-find__page'>
        <BarOption>
          <div className='input-search'>
            <Input
              name={'search'}
              placeholder='Search by address'
              onChange={handleChangeSearch}
            />
          </div>
          <div className='btns'>
            <div className='price' onClick={handleShowPrices}>
              <Button>
                {!filter.price.min && filter.price.max === Infinity && 'Price'}
                {filter.price.min ? kFormatter(filter.price.min) : ''}
                {(filter.price.min ? filter.price.min : '') &&
                  filter.price.max === Infinity &&
                  '>='}
                {(filter.price.min ? filter.price.min : '') &&
                  filter.price.max !== Infinity &&
                  '-'}
                {!filter.price.min && filter.price.max !== Infinity && '<='}
                {filter.price.max !== Infinity && kFormatter(filter.price.max)}
              </Button>
            </div>
            <div className='price-modal'>
              {showPrice &&
                createPortal(
                  <Price getData={handleGetPrice} onClose={handleShowPrices} />,
                  document.querySelector('.price-modal')
                )}
            </div>

            {/* Property type */}
            <div className='property-type' onClick={handleShowProperties}>
              <Button>
                {!filter.type_property.house &&
                  !filter.type_property.apartment &&
                  'property type'}
                {filter.type_property.house && 'Houses'}
                <span>
                  {filter.type_property.house &&
                    filter.type_property.apartment &&
                    '&'}
                </span>
                {filter.type_property.apartment && 'Aparments'}
              </Button>
            </div>
            <div className='property-modal'>
              {showProperties &&
                createPortal(
                  <Property
                    getProperty={handleGetProperty}
                    onClose={handleShowProperties}
                  />,
                  document.querySelector('.property-modal')
                )}
            </div>

            {/* beds and baths */}
            <div className='beds-baths' onClick={handleShowBbth}>
              <Button>
                {filter.services.bathrooms === null &&
                  filter.services.bedrooms === null &&
                  'beds & baths'}

                <span>
                  {filter.services.bedrooms === 0 && 0 + '+ BD,'}

                  {filter.services.bedrooms !== 0 &&
                    filter.services.bedrooms !== null &&
                    filter.services.bedrooms + '+ BD,'}
                </span>

                <span>
                  {filter.services.bathrooms === 0 && 0 + '+ BA'}

                  {filter.services.bathrooms !== 0 &&
                    filter.services.bathrooms !== null &&
                    filter.services.bathrooms + '+ BA'}
                </span>
              </Button>
            </div>
            <div className='bb-modal'>
              {showBbth &&
                createPortal(
                  <BedBath getBB={handleGetBB} onClose={handleShowBbth} />,
                  document.querySelector('.bb-modal')
                )}
            </div>

            {/* more button */}
            <div className='more' onClick={handleShowMore}>
              <Button>
                more
                <MdKeyboardArrowDown />
              </Button>
            </div>
            <div className='more-modal'>
              {showMore &&
                createPortal(
                  <More getMore={handleGetMore} onClose={handleShowMore} />,
                  document.querySelector('.more-modal')
                )}
            </div>
          </div>

          {/* buying & renting */}
          <div className='select-BR'>
            <div className='buying-renting' onClick={handleShowbuyRent}>
              <Button type={'secundary'}>
                {((filter.type_operation.both &&
                  !filter.type_operation.buying &&
                  !filter.type_operation.renting) ||
                  (filter.type_operation.buying &&
                    filter.type_operation.renting)) &&
                  'Both'}
                {filter.type_operation.buying &&
                  !filter.type_operation.renting &&
                  'Buying'}
                {filter.type_operation.renting &&
                  !filter.type_operation.buying &&
                  'Renting'}
                {!filter.type_operation.both &&
                  !filter.type_operation.buying &&
                  !filter.type_operation.renting &&
                  'Choose one'}
                <MdKeyboardArrowDown />
              </Button>
            </div>

            <div className='buy-rent_modal'>
              {showBuyRent &&
                createPortal(
                  <BuyOrRent
                    onHandle={handleChange}
                    data={filter.type_operation}
                  />,
                  document.querySelector('.buy-rent_modal')
                )}
            </div>
          </div>
        </BarOption>
        <>
          <p className='count_properties'>
            {PropertiesFiltered.length} Properties found
          </p>
          {!currentPageData.length ? (
            <NotFound />
          ) : (
            <>
              <div className='section-list'>
                {currentPageData.map((property) => (
                  <Card key={property.id} property={property} />
                ))}
              </div>
              <div className='pages'>
                <IoIosArrowBack
                  onClick={() => {
                    currentPage <= 1 ? '' : goToPage(currentPage - 1);
                  }}
                />
                {Array.from({ length: totalPage }, (_, index) => (
                  <div
                    key={index}
                    className='page'
                    style={{
                      backgroundColor:
                        currentPage == index + 1
                          ? 'rgba(244, 143, 177, 0.15)'
                          : 'white',
                      color: currentPage == index + 1 ? '#616161' : 'black',
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
                <IoIosArrowForward
                  onClick={() => {
                    currentPage >= totalPage ? '' : goToPage(currentPage + 1);
                  }}
                />
              </div>
            </>
          )}
        </>
      </div>
    </SectionFind>
  );
};

export default FindPage;
