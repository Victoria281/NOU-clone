// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import {
    playCard,
    playBotCard
} from "../../../store/action/singleplayer/game"
import { useDispatch } from 'react-redux'
import { Transition } from "react-transition-group";


//gets the data from the action object and reducers defined earlier
const BotCard = ({ card, cardId, identity, botPlay }) => {
    const nodeRef = useRef(null);
    const dispatch = useDispatch();
    const [inAProp, setInAProp] = useState(true);
    const [travelFromDeck, setTravelFromDeck] = useState({
        x: 0,
        y: 0
    });

    const timeout = 1000;

    

    useEffect(() => {
        if (botPlay) {
            // console.log("im true")
            const mainDeckDOM = document.getElementById("mainDeck").getBoundingClientRect();
            const selectedCardDOM = document.getElementById(`${cardId}`).getBoundingClientRect();
    
            switch (identity) {
                case "bot1": {
                    setTravelFromDeck({
                        y: -(mainDeckDOM.x - selectedCardDOM.x),
                        x: mainDeckDOM.y - selectedCardDOM.y
                    })
                    break;
                }
                case "bot2": {
                    setTravelFromDeck({
                        x: selectedCardDOM.x - mainDeckDOM.x,
                        y: -(mainDeckDOM.y - selectedCardDOM.y)
                    })
                    break;
                }
                case "bot3": {
                    setTravelFromDeck({
                        y: mainDeckDOM.x - selectedCardDOM.x,
                        x: -(mainDeckDOM.y - selectedCardDOM.y)
                    })

                    console.log("bot card")
                    console.log(selectedCardDOM)
                    console.log("main card")
                    console.log(mainDeckDOM)
                    console.log("calculation")
                    console.log(mainDeckDOM.x - selectedCardDOM.x)
                    console.log(mainDeckDOM.y - selectedCardDOM.y)
                    break;
                }
                default: 
                break;
            }
            setInAProp(false);
            setTimeout(() => {
                setInAProp(true);
                dispatch(playBotCard(card))
            }, timeout);
            
        } 
          
    }, [botPlay]);

  

    const defaultStyle = {

    };

    const transitionStyles = {
        entering: {
            opacity: 1
        },
        entered: {
            opacity: 1
        },
        exiting: {
            opacity: 1,
            // transform: `translate(${89}px, ${-300}px) rotate(${90}deg)`
        },
        exited: {
            opacity: 1,
            transform: `translate(${travelFromDeck.x}px, ${travelFromDeck.y}px) rotate(${90}deg)`,
            transition: `transform ${timeout}ms`,
            transitionTimingFunction: "linear"
        }
    };

    return (
        <Transition nodeRef={nodeRef} in={inAProp} timeout={timeout}>
            {(state) => {
                // // console.log(state);
                return (
                    <div
                        id={`${cardId}`}
                        style={{
                            ...defaultStyle,
                            ...transitionStyles[state]
                        }}
                        // className="p1cards"
                    >
                        
                            <img
                                className="img-responsive"
                                style={{ width: 70 }}
                                src={
                                    process.env.REACT_APP_API_URL + "/api/uno/images/" +
                                    card.image_file.slice(8)
                                }
                            />

                    </div>
                );
            }}
        </Transition>


    );
}
export default BotCard;