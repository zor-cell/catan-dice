const DICE_DEFAULT = [1, 2, 3, 4, 5, 6];
const DICE_RED = [1, 2, 3, 4, 5, 6];
const DICE_EVENT = ['e', 'e', 'e', 'y', 'b', 'g'];

//TODO
// --> all dice and event dice only
//allow to choose if default and red are probability or card mode
//and allot to choose if event is prob or card mode

//save roll history when page reloaded
// --> clear roll history
//ask if the last game should be continued

//a pair of a default and red dice
function dicePair(dice_default, dice_red) {
    this.dice_default = dice_default;
    this.dice_red = dice_red;
}

//a roll with default, red and event dice
function diceRoll(dice_pair, dice_event) {
    this.dice_default = dice_pair.dice_default;
    this.dice_red = dice_pair.dice_red;
    this.dice_event = dice_event;
    this.sum = this.dice_default + this.dice_red;
}

//return a random element from the array
function randElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffleCards() {
    //populate array of possible dice pairs
    let array = [];
    for(let i = 0;i < DICE_DEFAULT.length;i++) {
        for(let j = 0;j < DICE_RED.length;j++) {
            array.push(new dicePair(DICE_DEFAULT[i], DICE_RED[j]));
        }
    }

    return shuffle(array)
}

function shuffleEventCards() {
    //populate array of possible dice pairs
    let array = [];
    for(let i = 0;i < DICE_EVENT.length;i++) {
        array.push(DICE_EVENT[i]);
    }

    return shuffle(array)
}

//shuffle array randomly
function shuffle(array) {
    let oldElement;
    for (let i = array.length - 1; i > 0; i--) {
        let rand = Math.floor(Math.random() * (i + 1));
        oldElement = array[i];
        array[i] = array[rand];
        array[rand] = oldElement;
    }

    return array;
}

function App() {
    const [classicDiceIsCardsMode, setClassicDiceIsCardsMode] = React.useState(true);
    const [eventDiceIsCardsMode, setEventDiceIsCardsMode] = React.useState(false);

    const [currentRoll, setCurrentRoll] = React.useState(null);
    const [rollHistory, setRollHistory] = React.useState([]);
    const [showRollHistory, setShowRollHistory] = React.useState(false);

    const [playerName, setPlayerName] = React.useState("");
    const [players, setPlayers] = React.useState([]);
    const [playerTurn, setPlayerTurn] = React.useState(0);

    const [ship, setShip] = React.useState(new Array(7).fill(0));
    const [shipTurn, setShipTurn] = React.useState(0);
    const [isShipAttack, setIsShipAttack] = React.useState(false);

    const [cards, setCards] = React.useState(shuffleCards);
    const [cardShuffleThreshold, setCardShuffleThreshold] = React.useState(5);
    const [cardsIsShuffle, setCardsIsShuffle] = React.useState(false);
    const [cardsLeftover, setCardsLeftover] = React.useState([]);

    const [eventCards, setEventCards] = React.useState(shuffleEventCards);
    const [eventShuffleThreshold, setEventShuffleThreshold] = React.useState(0);
    const [eventCardsIsShuffle, setEventCardsIsShuffle] = React.useState(false);
    const [eventCardsLeftover, setEventCardsLeftover] = React.useState([]);

    React.useEffect(() => {
        showHistogram();
    }, [rollHistory, showRollHistory]);

    function toggleClassicDiceMode(event) {
        setClassicDiceIsCardsMode(!classicDiceIsCardsMode);
    }
    
    function toggleEventDiceMode(event) {
        setEventDiceIsCardsMode(!eventDiceIsCardsMode);
    }

    function changeShuffleThreshold(event) {
        setCardShuffleThreshold(parseInt(event.target.value));
    }

    function changeEventShuffleThreshold(event) {
        setEventShuffleThreshold(parseInt(event.target.value));
    }

    function clearCards(event) {
        setCards(shuffleCards);
        setCardsIsShuffle(false);
    }

    function clearEventCards(event) {
        setEventCards(shuffleEventCards);
        setEventCardsIsShuffle(false);
    }

    function toggleRollHistory(event) {
        setShowRollHistory(!showRollHistory);
    }

    function clearRollHistory(event) {
        setRollHistory([]);
    }

    function changePlayerName(event) {
        setPlayerName(event.target.value);
    }

    function addPlayer(event) {
        if(playerName === "" || players.length >= 4 || players.includes(playerName)) return;

        setPlayers(players => [...players, playerName]);
        setPlayerName("");
    }

    function removePlayer(player) {
        const newPlayers = [...players];
        const index = players.indexOf(player);
        newPlayers.splice(index, 1);

        setPlayers(newPlayers);

        //setPlayerTurn(playerTurn => (playerTurn + 1) % player.length);
    }

    function chooseDicePair() {
        if(classicDiceIsCardsMode) {
            let dice_pair = cards[cards.length - 1];

            //if card length reaches threshold they are reshuffled
            if(cards.length - 1 <= cardShuffleThreshold) {
                setCardsLeftover([...cards].slice(0, -1));
                setCardsIsShuffle(true);
                setCards(shuffleCards);
            } else {
                setCards([...cards].slice(0, -1));  //update cards (pop off last element)
                setCardsIsShuffle(false);
            }

            return dice_pair;
        }

        //probability mode
        return new dicePair(randElement(DICE_DEFAULT), randElement(DICE_RED));
    }

    function chooseDiceEvent() {
        if(eventDiceIsCardsMode) {
            let dice_event = eventCards[eventCards.length - 1];

            if(eventCards.length - 1 <= eventShuffleThreshold) {
                setEventCardsLeftover([...eventCards].slice(0, -1));
                setEventCardsIsShuffle(true);
                setEventCards(shuffleEventCards);
            } else {
                setEventCards([...eventCards].slice(0, -1));
                setEventCardsIsShuffle(false);
            }

            return dice_event;
        }

        //probability mode
        return randElement(DICE_EVENT)
    }

    function rollDice(event) {
        let dice_pair = chooseDicePair();
        let dice_event = chooseDiceEvent();

        let roll = new diceRoll(dice_pair, dice_event);

        if(players.length != 0) setPlayerTurn(playerTurn => (playerTurn + 1) % players.length);

        setIsShipAttack(false);
        if(dice_event == 'e') {
            if(shipTurn + 1 == ship.length - 1) {
                setIsShipAttack(true);
                setShipTurn(6);
            } else setShipTurn(shipTurn => (shipTurn + 1) % ship.length);
        }

        setCurrentRoll(roll);
        setRollHistory([roll, ...rollHistory]);
    }

    function showHistogram() {
        let container = document.getElementById('histogram');

        if(container == null || !showRollHistory) return;

        const RESULTS = 11;
        let x = [];
        for (let i = 0; i < RESULTS; i++) {
            x[i] = i + 2;
        }

        let y = Array(RESULTS).fill(0);
        for(let i = 0;i < rollHistory.length;i++) {
            let index = rollHistory[i].sum - 2;
            y[index]++;
        }

        let trace = {
            x: x,
            y: y,
            type: "bar",
            marker: {
                //color: 'rgb(245, 102, 181)'
            }
        };

        var data = [trace];
        let layout = {
            title: "Histogram of " + rollHistory.length + " Roll" + (rollHistory.length == 1 ? "" : "s"),
            bargap: 0.02,
            xaxis: {
                autotick: false,
                tick0: 2,
                dtick: 1,
            },
        }
        Plotly.newPlot('histogram', data, layout, {responsive: false, displayModeBar: false});

        //event plot
        /*x = ['e', 'y', 'g', 'b'];
        let temp = {};
        for(let i = 0;i < rollHistory.length;i++) {
            let key = rollHistory[i].dice_event;
            if(key in temp) temp[key]++;
            else temp[key] = 1;
        }

        y = Array(x.length).fill(0);
        for(let i = 0;i < x.length;i++) {
            let key = x[i];
            if(key in temp) y[i] = temp[key];
        }

        trace = {
            x: x,
            y: y,
            type: "bar",
        };
        data = [trace];
        layout = {
            title: "Event Histogram of " + rollHistory.length + " Roll" + (rollHistory.length == 1 ? "" : "s"),
            bargap: 0.02,
            xaxis: {
                autotick: false,
                tick0: 2,
                dtick: 1,
            },
        };
        Plotly.newPlot('histogram-event', data, layout, {responsive: true, displayModeBar: false});*/
    }

    function useAlchemist() {
        if(players.length != 0) setPlayerTurn(playerTurn => (playerTurn + 1) % players.length);

        let dice_pair = new dicePair(0, 0);
        let dice_event = chooseDiceEvent();
        let roll = new diceRoll(dice_pair, dice_event);

        setCurrentRoll(roll);
        setRollHistory([roll, ...rollHistory]);
    }

    function skipPlayer() {
        if(players.length != 0) setPlayerTurn(playerTurn => (playerTurn + 1) % players.length);
    }

    function changeDiceMode(event) {
        if(event.target.innerHTML === "Balance") {
            event.target.innerHTML = "Random";
        } else {
            event.target.innerHTML = "Balance";
        }
    }

    function mod(a, b) {
        return ((a % b) + b) % b;
    }

    return (
        <main>

            <section className="wrapper">

                <h1 className="header">Catan: Cities and Knights</h1>
                <h1 className="header2"> - Balanced Dice </h1>

                <section className="main-container">
                    <div className="flex-container">
                        <h3>Players</h3>
                        <div>
                            <p id="input-container">
                                <input type="text" placeholder="Name" value={playerName} onChange={changePlayerName}
                                       className="input"></input>
                                <button onClick={addPlayer} className="btn">Add</button>
                            </p>
                        </div>
                        <ol id="list">
                            {players.map((player, key) => {
                                return (
                                    <div key={key}>
                                        <p id="list-container">
                                            <li>{player}</li>
                                            <img id="remove-button" src="./assets/remove.svg"
                                                 onClick={() => removePlayer(player)}></img>
                                        </p>
                                    </div>)
                            })}
                        </ol>

                    </div>

                    <div className="flex-container">
                        <h3>Mode</h3>
                        <div id="dice-grid">
                            <p id="classic-dice">
                                <img src="./assets/4.svg"></img>
                                <img src="./assets/3_red.svg"></img>
                            </p>
                            <div className="button">
                                <input type="checkbox" className="checkbox" defaultChecked={!classicDiceIsCardsMode}
                                       onChange={toggleClassicDiceMode}/>
                                <div className="knobs"></div>
                                <div className="layer"></div>
                            </div>
                            <img id="event-dice" src="./assets/b.svg"></img>
                            <div className="button">
                                <input type="checkbox" className="checkbox" defaultChecked={!eventDiceIsCardsMode}
                                       onChange={toggleEventDiceMode}/>
                                <div className="knobs"></div>
                                <div className="layer"></div>
                            </div>
                        </div>
                        <button onClick={toggleRollHistory} id="roll-history">{showRollHistory ? "Hide" : "Show"} Roll
                            History
                        </button>
                        {/*<div><button onClick={clearRollHistory}>Clear Roll History</button></div>*/}
                    </div>

                    <div className="flex-container">
                        <h3>Settings</h3>

                        {classicDiceIsCardsMode ? <div className="mode-description">
                                <div className="settings-balance">
                                    <p>Degree of Random:</p>
                                    <input type="number" min="0" max="35" value={cardShuffleThreshold}
                                           onChange={changeShuffleThreshold} className="input2"></input>
                                    <button onClick={clearCards} className="btn2">Reshuffle</button>
                                </div>
                            </div> :
                            <div>
                                <p className="bold">True Random</p>
                            </div>}

                        {eventDiceIsCardsMode ? <div className="mode-description">
                                <div className="settings-balance">
                                    <p>Degree of Random:</p>
                                    <input type="number" min="0" max="5" value={eventShuffleThreshold}
                                           onChange={changeEventShuffleThreshold} className="input2"></input>
                                    <button onClick={clearEventCards} className="btn2">Reshuffle</button>
                                </div>
                            </div> :
                            <div>
                                <p className="bold">True Random</p>
                            </div>}

                        {showRollHistory ? <div id="history-balance1">

                            </div> :
                            <div id="history-balance0">

                            </div>}

                    </div>
                </section>

                <h2>Game Simulation</h2>

                <section className="main-container2">

                    <div className="flex-container2" id="player-turn">
                        <div id="list2">
                            <ol>
                                {players.map((player, index) => {
                                    return (
                                        index == playerTurn
                                            ? <b key={index}>
                                                <li id="turn">{player}</li>
                                            </b>
                                            : <li key={index}>{player}</li>
                                    )
                                })}
                            </ol>
                        </div>
                        {/*<button onClick={skipPlayer} id="skip-player">Skip Player</button>*/}
                    </div>

                    <div id="buttons-flex">
                        <button onClick={rollDice} id="roll-button">Dice</button>
                        <button onClick={useAlchemist} id="alchemist-button">Alchemist</button>
                    </div>

                    <div className="flex-container2">
                        <div className="current-turn">
                            <p id="current-turn-player">
                                {players.map((player, index) => {
                                    return (
                                        index === mod(playerTurn - 1, players.length)
                                            ? <p key={index}>
                                                {player}
                                            </p>
                                            : <p></p>
                                    )
                                })}
                            </p>
                            <b className="spacer">
                                |
                            </b>
                            <p id="current-turn-roll">
                                <DisplayDiceRoll roll={currentRoll}/>
                            </p>
                        </div>
                        <div className="ship-flex">
                            {ship.map((_, index) => {
                                return (
                                    index == shipTurn
                                        ? <img className="ship-tile-current" key={index} src="./assets/e_2b.svg"></img>
                                        : (index == ship.length - 1
                                                ? <div className="ship-tile-last" key={index}></div>
                                                : <div className="ship-tile" key={index}></div>
                                        )
                                )
                            })}
                            {isShipAttack && <p id="attack">CHARGE </p>}
                            {!isShipAttack && <p id="safe"> </p>}
                        </div>
                    </div>
                </section>

                {classicDiceIsCardsMode && cardsIsShuffle && cardsLeftover.length != 0 &&
                    <div className="flex-container2">
                        <div id="leftover-list">
                            <ol>
                                <b>Unused Cards:</b>
                                {cardsLeftover.map((dice_pair, key) => {
                                    return <DisplayDicePair pair={dice_pair} key={key}/>;
                                })}
                            </ol>
                        </div>
                    </div>}
                {eventDiceIsCardsMode && eventCardsIsShuffle && eventCardsLeftover.length != 0 &&
                    <div className="flex-container2">
                        <div id="leftover-list">
                            <ol>
                                <b>Unused Cards</b>
                                {eventCardsLeftover.map((dice_event, key) => {
                                    return <DisplayDiceEvent event={dice_event} key={key}/>;
                                })}
                            </ol>
                        </div>
                    </div>}

            </section>

            {showRollHistory &&
            <section className="main-container3">

                <div id="roll-history-header">
                    <h2>Roll History</h2>
                </div>

                <div className="flex-container3">
                    <p style={{display: showRollHistory ? "none" : "block"}}>Hidden</p>
                    {showRollHistory && rollHistory.length == 0 ? <p>None yet</p> :
                        <div style={{display: showRollHistory ? "flex" : "none"}} id="histogram-container">
                            <div id="histogram"></div>
                            <div id="history-list">
                                <ol>
                                    {rollHistory.map((dice_roll, key) => {
                                        return <DisplayDiceRoll roll={dice_roll} key={key}/>;
                                    })}
                                </ol>
                            </div>
                        </div>}
                </div>
            </section>}
        </main>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('container')
);

function DisplayDiceRoll(props) {
    //empty roll result
    if (props.roll == null) return <div>
        <p className="roll"></p>
    </div>

    //show roll result
    return <div>
        <img className="dice" src={"assets/" + props.roll.dice_default + ".svg"} width="20"/>
        <img className="dice" src={"assets/" + props.roll.dice_red + "_red.svg"} width="20"/>
        <img className="dice" src={"assets/" + props.roll.dice_event + ".svg"} width="20"/>
    </div>
}

function DisplayDicePair(props) {
    //empty roll result
    if (props.pair == null) return <div>
        <p>None</p>
    </div>

    //show roll result
    return <div>
        <img className="dice" src={"assets/" + props.pair.dice_default + ".svg"} width="20"/>
        <img className="dice" src={"assets/" + props.pair.dice_red + "_red.svg"} width="20"/>
    </div>
}

function DisplayDiceEvent(props) {
    //empty roll result
    if (props.event == null) return <div>
        <p>None</p>
    </div>

    //show roll result
    return <div>
        <img className="dice" src={"assets/" + props.event + ".svg"} width="20"/>
    </div>
}
