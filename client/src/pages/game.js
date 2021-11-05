import React, { Fragment, useEffect, useState } from "react";

import shuffleCards from "../components/shuffle";
import "../index.css";

const Game = () => {
  const [cards, setCards] = useState([]);
  const [mainDeck, setMainDeck] = useState([]);
  const [used, setUsed] = useState([]);
  const [current, setCurrent] = useState({ card: "", cardid: 0 });
  const [players, setPlayers] = useState({
    player1: [],
    player2: [],
    player3: [],
    player4: []
  });
  // const [order, setOrder] = useState(shuffleCards([0, 1, 2, 3]));
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const [turn, setTurn] = useState(order[0]);
  const [selectColor, setSelectColor] = useState(false);
  const [play, setPlay] = useState({
    player1: {
      id: 0,
      values: 0,
      color: 0,
      image_file: ""
    },
    player2: {
      id: 0,
      values: 0,
      color: 0,
      image_file: ""
    },
    player3: {
      id: 0,
      values: 0,
      color: 0,
      image_file: ""
    },
    player4: {
      id: 0,
      values: 0,
      color: 0,
      image_file: ""
    }
  });
  const botplay = (arr) => {
    console.log("Bot plays card");
    // console.log(arr);
    // console.log(current);
    var normal_playable = arr.filter(
      (item) => item.color === current.color || item.values === current.values
    );
    var wild_playable = arr.filter((item) => item.color === "wild");

    console.log("Bot can play");
    console.log(normal_playable);
    console.log(wild_playable);

    var r = Math.random();
    var cardplayed = {};

    if (wild_playable.length !== 0 && normal_playable.length !== 0) {
      if (r < 0.75) {
        cardplayed =
          wild_playable[Math.floor(Math.random() * wild_playable.length)];
      } else {
        cardplayed =
          normal_playable[Math.floor(Math.random() * normal_playable.length)];
      }
      playCard(cardplayed, arr);
    } else if (wild_playable.length !== 0) {
      cardplayed =
        wild_playable[Math.floor(Math.random() * wild_playable.length)];
      playCard(cardplayed, arr);
    } else if (normal_playable.length !== 0) {
      cardplayed =
        normal_playable[Math.floor(Math.random() * normal_playable.length)];
      playCard(cardplayed, arr);
    } else {
      console.log("no card to play");
      // console.log(turn + 1);
      var expectedPlayerInd = order.indexOf(turn);
      expectedPlayerInd += 1;
      if (expectedPlayerInd === 4) {
        expectedPlayerInd = 0;
      } else if (expectedPlayerInd > 4) {
        expectedPlayerInd = Math.trunc(expectedPlayerInd / 4);
      }
      // console.log(order[expectedPlayerInd] + 1);
      setTurn(order[expectedPlayerInd]);
    }
  };
  const Bot = (arr) => {
    return (
      <ul>
        {arr.arr.map((decks) => (
          <li key={decks.id}>
            <div>
              <img
                className="img-responsive"
                src={decks.image_file}
                alt={decks.values + " " + decks.color}
              />
              <p className="imageText">{decks.image_file}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const Player = ({ player }) => {
    return (
      <ul>
        {turn === 0 &&
          player.map((decks) => (
            <li key={decks.id}>
              <div
                onClick={() => {
                  playCard(decks, player);
                }}
              >
                <img
                  className="img-responsive"
                  src={decks.image_file}
                  alt={decks.values + " " + decks.color}
                />
                <p className="imageText">{decks.image_file}</p>
              </div>
            </li>
          ))}
        {turn !== 0 &&
          player.map((decks) => (
            <li key={decks.id}>
              <div>
                <p>{decks.values}</p>
                <p>{decks.color}</p>
              </div>
            </li>
          ))}
      </ul>
    );
  };

  const playCard = (cardInfo, player) => {
    console.log("played card");
    console.log(cardInfo);
    console.log(player);

    used.push(current);
    setUsed(used);
    setCurrent(cardInfo);
    var player_new = player.filter((item) => item !== cardInfo);
    players["player" + (turn + 1)] = player_new;
    // console.log(player_new);
    // console.log(players["player" + turn]);
    setPlayers(players);
    play["player" + (turn + 1)] = cardInfo;
    setPlay(play);

    console.log("current player " + (turn + 1));
    var expectedPlayerInd = order.indexOf(turn);
    expectedPlayerInd += 1;
    if (expectedPlayerInd === 4) {
      expectedPlayerInd = 0;
    } else if (expectedPlayerInd > 4) {
      expectedPlayerInd = Math.trunc(expectedPlayerInd / 4);
    }
    console.log("next player " + (order[expectedPlayerInd] + 1));

    switch (cardInfo.values) {
      //skip is 10
      case "10":
        console.log("skip called");
        // console.log(turn);
        // console.log(order.indexOf(turn));
        var currentplayerIndex = order.indexOf(turn);
        currentplayerIndex += 2;
        if (currentplayerIndex === 4) {
          currentplayerIndex = 0;
        } else if (currentplayerIndex > 4) {
          currentplayerIndex = Math.trunc(currentplayerIndex / 4);
        }

        play["player" + (order[currentplayerIndex] - 2)] = {
          id: 0,
          values: 0,
          color: 0,
          image_file: ""
        };
        setPlay(play);
        setTurn(order[currentplayerIndex]);
        // console.log(turn);
        console.log("skip ended");
        break;

      //reverse is 11
      case "11":
        console.log("reverse called");
        var newOrder = [order[3], order[2], order[1], order[0]];
        var reverseplayerIndex = newOrder.indexOf(turn);
        reverseplayerIndex += 1;
        if (reverseplayerIndex === 4) {
          reverseplayerIndex = 0;
        } else if (reverseplayerIndex > 4) {
          reverseplayerIndex = Math.trunc(reverseplayerIndex / 4);
        }

        console.log(
          "reverse next player " + (newOrder[reverseplayerIndex] + 1)
        );
        setOrder(newOrder);
        setTurn(newOrder[reverseplayerIndex]);
        console.log("reverse ended");

        break;

      //+2 draw is 12
      case "12":
        console.log("draw 2 called");
        for (var draw2 = 0; draw2 < 2; draw2++) {
          players["player" + (order[expectedPlayerInd] + 1)].push(
            mainDeck[draw2]
          );
        }
        setMainDeck(mainDeck.slice(2, mainDeck.length));
        setPlayers(players);
        console.log("draw 2 ended");
        setTurn(order[expectedPlayerInd]);
        break;

      //wild is 13
      case "13":
        console.log("wild called");
        // console.log(selectColor);
        // setSelectColor(true);
        // console.log(selectColor);
        console.log("wild ended");
        setTurn(order[expectedPlayerInd]);
        break;

      //+4 is 14
      case "14":
        console.log("draw 4 called");
        for (var draw4 = 0; draw4 < 4; draw4++) {
          players["player" + (order[expectedPlayerInd] + 1)].push(
            mainDeck[draw4]
          );
        }
        setMainDeck(mainDeck.slice(4, mainDeck.length));
        setPlayers(players);
        console.log("draw 4 ended");
        setTurn(order[expectedPlayerInd]);
        break;

      default:
        console.log("default called");
        // console.log(turn);
        // console.log(expectedPlayerInd);
        setTurn(order[expectedPlayerInd]);
        // console.log(turn);
        console.log("default ended");
        break;
    }

    return player;
  };
  const dealCards = (cardarray) => {
    console.log("dealing cards");
    // console.log(cardarray);
    var dealplayers = {
      player1: [],
      player2: [],
      player3: [],
      player4: []
    };
    for (var start = 0; start < 8; start++) {
      dealplayers.player1.push(cardarray[0]);
      dealplayers.player2.push(cardarray[1]);
      dealplayers.player3.push(cardarray[2]);
      dealplayers.player4.push(cardarray[3]);
      cardarray = cardarray.slice(4, cardarray.length);
    }

    console.log("dealt cards");
    // console.log(cardarray);
    return [dealplayers, cardarray];
  };

  const getCards = async () => {
    console.log("retrieving cards");
    try {
      const response = await fetch("/getall");
      const jsonData = await response.json();
      var cards_retrieved = jsonData.cards;
      setCards(cards_retrieved);
      // console.log("cardsretriev ");
      cards_retrieved = shuffleCards(cards_retrieved);
      var arr = dealCards(cards_retrieved);
      cards_retrieved = arr[1];
      setPlayers(arr[0]);
      console.log(cards_retrieved);
      setMainDeck(cards_retrieved.slice(1, cards_retrieved.length));
      setCurrent(cards_retrieved[0]);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getCards();
  }, []);

  useEffect(() => {
    console.log("Now is player " + (turn + 1) + " turn");
    if (
      (players.player1.length === 0 ||
        players.player2.length === 0 ||
        players.player3.length === 0 ||
        players.player4.length === 0) &&
      (mainDeck.length > 0 || used > 0)
    ) {
      // console.log("HERERERERERERERER");
      // console.log("SOMEONEEEEEEENDEDDDD");
      history.push({
        pathname: "/end",
        state: {
          players: players
        }
      });
    } else {
      if (turn !== 0) {
        botplay(players["player" + (turn + 1)]);
      }
    }
  }, [turn]);

  return (
    <div className="container">
      <table class="table mt-5 text-center">
        <tr>
          <th>
            <h4>Current card</h4>
          </th>
          <th>
            <h4>Order</h4>
          </th>
          <th>
            <h4>Turn</h4>
          </th>
          <th>
            <h4>Special</h4>
          </th>
        </tr>
        <tr>
          <td>
            {current.color} {current.values}
          </td>
          <td>{order}</td>
          <td>Player {turn + 1}</td>
          <td>{selectColor && <p>Choose a color</p>}</td>
        </tr>
      </table>

      <table class="table mt-5 text-center">
        <tr>
          <th>
            <h6>P1</h6>
          </th>
          <th>
            <h6>B1</h6>
          </th>
          <th>
            <h6>B2</h6>
          </th>
          <th>
            <h6>B3</h6>
          </th>
        </tr>
        <tr>
          <td>
            <p>{play.player1.values + " " + play.player1.color}</p>
            <p className="imageText">{play.player1.image_file}</p>
          </td>
          <td>
            <p>{play.player2.values + " " + play.player2.color}</p>
            <p className="imageText">{play.player2.image_file}</p>
          </td>
          <td>
            <p>{play.player3.values + " " + play.player3.color}</p>
            <p className="imageText">{play.player3.image_file}</p>
          </td>
          <td>
            <p>{play.player4.values + " " + play.player4.color}</p>
            <p className="imageText">{play.player4.image_file}</p>
          </td>
        </tr>
      </table>

      <div class="row">
        <div class="col-sm-3">
          <h5>Player 1</h5>
          <Player player={players.player1} type="human" />
        </div>
        <div class="col-sm-3">
          <h5>Bot 1</h5>
          <Bot arr={players.player2} />
        </div>
        <div class="col-sm-3">
          <h5>Bot 2</h5>
          <Bot arr={players.player3} />
        </div>
        <div class="col-sm-3">
          <h5>Bot 3</h5>
          <Bot arr={players.player4} />
        </div>
      </div>
    </div>
  );
};

export default Game;