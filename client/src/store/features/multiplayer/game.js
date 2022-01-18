// @ts-nocheck

import { ContactlessOutlined } from "@material-ui/icons";

export const shuffleCards = (cardarray) => {
    for (var i = cardarray.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cardarray[i];
        cardarray[i] = cardarray[j];
        cardarray[j] = temp;
    }
    return cardarray;
};

export const getRandomInt = (num) => {
    return Math.floor(Math.random() * num);
};

export const checkFirstCardPlayable = (c1, c2) => {
    // // console.log(c1)
    // // console.log(c2)
    if ((c1.color === c2.color ||
        c1.values === c2.values ||
        c1.color === "wild")) {
            // // console.log("true")
        return true
    } else {
        // // console.log("false")
        return false
    }
};

export const getOrderArray = (num) => {
    var order_arr = []
    for (var i = 0; i < num; i++) {
        order_arr.push(i)
    }
    order_arr = shuffleCards(order_arr)
    return order_arr
};

export const getAllCards = async () => {
    try {
        const response = await fetch(process.env.REACT_APP_API_URL + "/api/uno/cards");
        const jsonData = await response.json()
        var cards_retrieved = shuffleCards(jsonData.cards);
        return cards_retrieved
    } catch (err) {
        // console.log("error")
        // console.error(err.message);
    }
}

export const dealCards = (cardarray, numOfPlayers) => {
    cardarray.map((card)=>{
        card["botPlayCard"] = false
    })
    var dealplayers = {};
    for (var players = 0; players < numOfPlayers; players++) {
        dealplayers["player" + players] = []
        for (var start = 0; start < 7; start++) {
            dealplayers["player" + players].push(cardarray[(start * numOfPlayers) + players]);
        }
    }
    cardarray = cardarray.slice(numOfPlayers * 7);
    return [dealplayers, cardarray];
}

export const filterPlayableCards = (currentCard, playerDeck, myTurn) => {
    playerDeck.map((cards) => {
        if (checkFirstCardPlayable(cards, currentCard) && myTurn) {
            cards.playable = true
        } else {
            cards.playable = false
        }
    })
    return playerDeck;
}

export const getNextTurn = (currentTurn, order) => {

    var playerInOrder = order.findIndex(t => t === currentTurn)
    playerInOrder += 1;
    if (playerInOrder >= order.length) {
        playerInOrder = 0;
    }
    return order[playerInOrder];
}

export const getPrevTurn = (currentTurn, order) => {

    var playerInOrder = order.findIndex(t => t === currentTurn)
    playerInOrder -= 1;
    if (playerInOrder == -1) {
        playerInOrder = order.length-1;
    }
    return order[playerInOrder];
}

export const playSkip = (game_state) => {
    var skippedTurn = getNextTurn(game_state.turn, game_state.order)
    game_state.turn = getNextTurn(skippedTurn, game_state.order)
    return game_state
}

export const playReverse = (game_state) => {
    game_state.order = game_state.order.reverse();
    game_state.turn = getNextTurn(game_state.turn, game_state.order)
    return game_state
}

export const playDraw = (game_state, numOfCards, color) => {
    // console.log("in DRAW")
    var playerToDrawCard = getNextTurn(game_state.turn, game_state.order)
    for (var amtToDraw = 0; amtToDraw < numOfCards; amtToDraw++) {
        game_state.playerdeck["player" + playerToDrawCard].push(game_state.mainDeck[amtToDraw]);
    }
    game_state.mainDeck = game_state.mainDeck.slice(numOfCards)
    game_state.turn = getNextTurn(playerToDrawCard, game_state.order)
    game_state.current.color = color
    return game_state
}

export const playWild = (game_state, color) => {
    // console.log("in wikde")
    game_state.turn = getNextTurn(game_state.turn, game_state.order)
    game_state.current.color = color
    return game_state
}

export const checkOneCardLeft = (game_state) => {
    // if (game_state.playerdeck["player" + game_state.turn].length === 1 && game_state.unoPressed) {

    // }
    // return game_state
    // console.log("check uno")
    // console.log(game_state.unoPressed)
}

export const drawACard = (game_state) => {
    var drawnCard = game_state.mainDeck[0]
    game_state.mainDeck = game_state.mainDeck.slice(1);
    if (checkFirstCardPlayable(drawnCard, game_state.current)) {
        if (drawnCard.color !== undefined && drawnCard.color === "wild"){
            return drawnCard
        } else {
            game_state = applyCard(null, game_state, drawnCard, null)
        }
    } else {
        game_state.playerdeck["player" + game_state.turn].push(drawnCard)
    }
    game_state.turn = getNextTurn(game_state.turn, game_state.order)
    return game_state
}

export const applyCard = (color, game_state, card, first) => {
    if (first === null) {
        game_state.used.push(game_state.current)
        game_state.playerdeck["player" + game_state.turn] = game_state.playerdeck["player" + game_state.turn].filter(player_card => player_card !== card);
    } else {
        if (card.color === "wild"){
            var unoColors = ["red", "green", "blue", "yellow"]
            color = unoColors[getRandomInt(4)]
        }
        game_state.turn = getPrevTurn(game_state.turn, game_state.order)
    }
    console.log("------------------------------------------")
    console.log("Card has been played")
    console.log(card)
    console.log(game_state)
    game_state.current = card

    switch (card.values) {
    // switch ("1") {
        //skip is 10
        case "10":
            // // console.log("skipped played")
            // // console.log(game_state)
            game_state = playSkip(game_state)
            break;

        //reverse is 11
        case "11":
            // // console.log("reverse played")
            // // console.log(game_state)
            game_state = playReverse(game_state)
            break;

        //+2 draw is 12
        case "12":
            // // console.log("+2 played")
            // // console.log(game_state)
            game_state = playDraw(game_state, 2)
            break;

        //wild is 13
        case "13":
            // // console.log("wild played")
            // // console.log(game_state)
            // // console.log("i dunno")
            game_state = playWild(game_state, color)
            break;

        //+4 is 14
        case "14":
            // // console.log("+4 played")
            // // console.log(game_state)
            game_state = playDraw(game_state, 4, color)
            break;

        default:
            // // console.log("normal card played")
            // // console.log(game_state)
            game_state.turn = getNextTurn(game_state.turn, game_state.order)
            break;
    }
    console.log("new")
    console.log(game_state)
    console.log("-------------------END---------------")
    // // console.log("---------------------------------------------")
    return game_state
}



