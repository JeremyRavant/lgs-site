import React from 'react'
import './Contact.scss'

function contact() {
  return (
    <div className='contact'>
        <div className='contact__title'>Contactez nous</div>
        <div className='contact__content'>
            <div className='infos'>
                <p>Notre atelier est fermé au public, mais pour plus d’informations, vous pouvez nous téléphoner, nous envoyer un email, 
                    ou nous laisser un message.</p>
                <div className='info__container'>
                    <div className='info__section'>
                        <div className='icone__section'>
                            <i className="fa-regular fa-clock"></i>
                        </div>
                        <div className='content__info'>
                            <h3>Heures d'Ouverture</h3>
                            <p>Lundi au vendredi</p>
                            <p>8h00 à 12h00 et 14h00 à 18h00</p>
                        </div>
                    </div>
                    <div className='info__section'>
                        <div className='icone__section'>
                            <i className="fa-regular fa-envelope"></i>
                        </div>
                        <div className='content__info'>
                            <h3>Contact Info</h3>
                            <p>06 10 52 01 78</p>
                            <p>contact@lgs-metallerie.com</p>
                        </div>
                    </div>
                    <div className='info__section'>
                        <div className='icone__section'>
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <div className='content__info'>
                            <h3>Adresse</h3>
                            <p>16, route de la forêt</p>
                            <p>76113 SAHURS</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='infos__picture'>
                <img src="contact-picture.jpg" alt="photo de verrière" />
            </div>
        </div>
    </div>
  )
}

export default contact
