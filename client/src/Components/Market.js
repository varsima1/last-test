import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { FaSearch, FaList, FaPlusCircle, FaEdit, FaTrash, FaShoppingBasket } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './scss/Market/market.scss';
import carImage from './image/car.jpg';
import pcImage from './image/pc.jpg';
import headphonesImage from './image/headphones.jpg';
import keyboardImage from './image/keyboard.jpg';
import tvImage from './image/tv.jpg';
import tableImage from './image/table.jpg';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import withLoader from './loader/withLoader';
import axios from 'axios';
import { useAuth } from './AuthContext';
import EditCard from './EditCard';
import { useShoppingCard } from './ShoppingCardContext';
import SearchBar from './SearchBar';
import { useForceUpdate } from './useForceUpdate';



const PrevArrow = ({ onClick }) => (
  <button className="custom-prev" onClick={onClick}>
    <FaChevronLeft />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button className="custom-next" onClick={onClick}>
    <FaChevronRight />
  </button>
);

function Market() {
  const { token, userObject } = useAuth();
  const [cards, setCards] = useState([]);
  const [editCardId, setEditCardId] = useState(null);
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };
  const forceUpdate = useForceUpdate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCard,removeFromCard } = useShoppingCard();
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = ({ term, category }) => {
    setSearchTerm(term);
    setSelectedCategory(category);
  };

  const handleSort = (order) => {

    let sortedCards;

    switch (order) {
      case 'asc':

        sortedCards = [...cards].sort((a, b) => a.price - b.price);
        break;
      case 'desc':

        sortedCards = [...cards].sort((a, b) => b.price - a.price);
        break;
      case 'priceHigh':

        sortedCards = [...cards].sort((a, b) => b.price - a.price);
        break;
      case 'priceLow':

        sortedCards = [...cards].sort((a, b) => a.price - b.price);
        break;
      default:

        sortedCards = cards;
        break;
    }

    setCards(sortedCards);
  };
// /////////////////////////////////////////////////////////////////////////////////

  // const handleShopping = async (cardId) => {
  //   const selectedCard = cards.find((card) => card._id === cardId);    
  //   // const isCardInShoppingCart = shoppingCard.some((cardItem) => cardItem._id === cardId);
  
  //   try {
  //     await axios.patch(`http://localhost:8181/cards/${cardId}`, null, {
  //       headers: {
  //         'x-auth-token': token,
  //       },
  //     });
  //     if(selectedCard.likes.includes(userObject._id)) {
  //       removeFromCard(cardId);
  //     }else  {
  //       addToCard(selectedCard);
  //     }
      
  //     // 1mission. check if user is logged in 
  //     // if not 
  //     // 2mission. add item in session storage in array
  //     // 3mission.login check if is something in session storage 
  //     // if yes 
  //     // send it to backend
  //     // 4mission delete item in session storage

// /////////////////////////////////////////////////////////////////////////////////


const handleShopping = async (cardId) => {
  const selectedCard = cards.find((card) => card._id === cardId);

  try {
    if (!token) {
      const shoppingItems = JSON.parse(sessionStorage.getItem('shoppingItems')) || [];
      const isItemInCart = shoppingItems.includes(cardId);
      if (isItemInCart) {
        const updatedItems = shoppingItems.filter((item) => item !== cardId);
        sessionStorage.setItem('shoppingItems', JSON.stringify(updatedItems));
        removeFromCard(cardId)
        // console.log('Item removed from session storage:', cardId);
      } else {
        addToCard(selectedCard)
        shoppingItems.push(cardId);
        sessionStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));
        // console.log('Item added to session storage:', cardId);
      }
      forceUpdate();
      return;
    }
    const sessionItems = JSON.parse(sessionStorage.getItem('shoppingItems')) || [];
    if (sessionItems.length > 0) {
      await sendItemsToBackend(sessionItems);
      sessionStorage.removeItem('shoppingItems');
    }
    await axios.patch(`http://localhost:8181/cards/${cardId}`, null, {
      headers: {
        'x-auth-token': token,
      },
    });
    if (selectedCard.likes.includes(userObject._id)) {
      removeFromCard(cardId);
    } else {
      addToCard(selectedCard);
    }
    setCards((prev) =>
      prev.map((x) => {
        if (x._id !== cardId) return x;
        const likes = x.likes;
        let newLikes;
        if (x.likes.includes(userObject._id)) {
          newLikes = x.likes.filter((userID) => userID !== userObject._id);
        } else {
          newLikes = [...likes, userObject._id];
        }
        return {
          ...x,
          likes: newLikes,
        };
      })
    );
    forceUpdate();
    // console.log('Shopping successful!');
  } catch (error) {
    console.error('Error shopping:', error);
  }
};
// ///////////////////////////////////////////////////////////////////////////////////

// ///////////////////////////////////////////////////////////////////////////////////



  const sendItemsToBackend = async (items) => {
    try {
      console.log('Sending items to the backend:', items);
    } catch (error) {
      console.error('Error sending items to the backend:', error);
    }
  };



  
  const handleCancelEdit = () => {
    setEditCardId(null);
  };

  const handleEditClick = async (cardId, e) => {
    const Confirmed = window.confirm('Do you want to edit the card?');
    if (Confirmed) {
      try {
        const response = await axios.put(
          `http://localhost:8181/cards/${cardId}`,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
        console.log('Card sent successfully');
        setEditCardId(null);
  
        if (response && response.data) {
          const updatedCard = response.data;
          setCards((prevCards) =>
            prevCards.map((prevCard) => (prevCard._id === updatedCard._id ? updatedCard : prevCard))
          );
        }
      } catch (error) {
        console.error('Error editing card:', error);
        e.preventDefault();
      }
    } else {
      e.preventDefault();
    }
  };
  


  const handleDeleteClick = async (cardId) => {
    const isConfirmed = window.confirm('Do you want to delete the card?');
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:8181/cards/${cardId}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        console.log('Card deleted!');
        setCards((prev) => prev.filter((x) => (x._id === cardId ? false : true)));
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get('http://localhost:8181/cards');
        setCards(response.data);
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    };

    fetchCards();
  }, []);

  return (
    <>
        <div className='slider-container'>
       {/* Slider */}
        <Slider  {...sliderSettings}>
        <div className='slide1' >
          <img src={carImage} alt='Image1' className='Sliderimage'/>
          <div className='text-overlay'>
          <h1>best marketplace ever</h1>
          <p>you can buy items here at the best price</p>
        </div>
        </div>
        <div className='slide1' >
          <img src={pcImage} alt='Image2' />
          <div className='text-overlay'>
          <h1>best marketplace ever</h1>
          <p>you can buy items here at the best price</p>
        </div>
        </div>
        <div className='slide1' >
          <img src={headphonesImage} alt='Image3' />
          <div className='text-overlay'>
          <h1>best marketplace ever</h1>
          <p>you can buy items here at the best price</p>
        </div>
        </div>
        <div className='slide1' >
          <img src={keyboardImage} alt='Image4' />
          <div className='text-overlay'>
          <h1>best marketplace ever</h1>
          <p>you can buy items here at the best price</p>
        </div>
        </div>
        <div className='slide1' >
          <img src={tvImage} alt='Image5' />
          <div className='text-overlay'>
          <h1>best marketplace ever</h1>
          <p>you can buy items here at the best price</p>
        </div>
        </div>
        <div className='slide1' >
          <img src={tableImage} alt='Image6' />
          <div className='text-overlay'>
          <h1>best marketplace ever</h1>
          <p>you can buy items here at the best price</p>
        </div>
        </div>
      </Slider>
      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        selectedCategory={selectedCategory}
        onSort={handleSort}
      />
    </div >
    <div style={{      
      display: 'flex',
      justifyContent:'right',
      marginTop: '20px',
      marginBottom: '50px',
      }}>
        {userObject?.isSeller && (
        <>

        <Link to={'/marketCreateCard'} title='Add item and sell it'>
    <FaPlusCircle  style={{
      height:'40px',
      width:'40px',
      color:'#007bff',
      cursor:'pointer',
      backgroundColor:'white',
      borderRadius:'30px',
      }}/>
</Link>
        </>
      )}
      </div>
      <div className="mcard-container">
      {cards
          .filter(
            (card) =>
              (selectedCategory === 'All' || card.category === selectedCategory) &&
              (card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.price.toString().includes(searchTerm) ||
                card.phone.toString().includes(searchTerm))
          )
          .map((card) =>(
            <div className="mcards" key={card._id}>
              <img className="card-image" src={card.image.url} alt={card.image.alt} />

              <p className="mcards-title">{card.title}</p>
              <p>{card.category}</p>
              <p>{card.subtitle}</p>
              <p className="mcards-description">{card.description}</p>
              <p>{card.phone}</p>
              <p className="mcards-price">{card.price} {card.currency}</p>

              {card.user_id === userObject?._id && (
                <>
                  <FaTrash className="trash-icon"style={{color:'grey'}} onClick={() => handleDeleteClick(card._id)} />
                <Link to={'/editCard/' + card._id} style={{color:'grey'}}><FaEdit className="edit-icon" onClick={(e) => handleEditClick(card._id, e)} /></Link>
                </>
              )}
            {/* <FaShoppingBasket
            className={`shop-icon ${card.likes.includes(userObject?._id) ? 'added-to-cart' : ''}`}
            onClick={() => handleShopping(card._id)}
/> */}
<FaShoppingBasket
  className={`shop-icon ${userObject && userObject._id && card.likes.includes(userObject._id) ? 'added-to-cart' : ''}${sessionStorage.getItem('shoppingItems') && JSON.parse(sessionStorage.getItem('shoppingItems')).includes(card._id) ? 'added-to-cart' : ''}`}
  onClick={() => handleShopping(card._id)}
/>
            </div>
          ))}
      </div>

      {editCardId && (
        <EditCard
          cardId={editCardId}
          onCancel={handleCancelEdit}
          onCardUpdate={(updatedCard) => {
            setCards((prevCards) =>
              prevCards.map((prevCard) => (prevCard._id === updatedCard._id ? updatedCard : prevCard))
            );
            setEditCardId(null);
          }}
        />
      )}
    </>
  );
}

export default withLoader(Market);
