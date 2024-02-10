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
    const [classicDiceIsCardsMode, setClassicDiceIsCardsMode] = React.useState(false);
    const [eventDiceIsCardsMode, setEventDiceIsCardsMode] = React.useState(false);

    const [currentRoll, setCurrentRoll] = React.useState(null);
    const [rollHistory, setRollHistory] = React.useState([]);
    const [showRollHistory, setShowRollHistory] = React.useState(true);

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
        Plotly.newPlot('histogram', data, layout, {responsive: true, displayModeBar: false});
    }

    return (
      <main>
        <section className="main-container">
            <h1>Catan Dice Roll Simulation</h1>
            <h2>Parameters</h2>
            <div>
                <h3>Dice Mode</h3>
                <p className="small-p">The mode of dice rolls.</p>

                <div className="flex-container-horizontal">
                    <div>
                        <h4>Classic dice</h4>
                        <button onClick={toggleClassicDiceMode}>Set {!classicDiceIsCardsMode ? "Card" : "Probability"} Mode</button>
                    </div>
                    <div>
                        <h4>Event die</h4>
                        <button onClick={toggleEventDiceMode}>Set {!eventDiceIsCardsMode ? "Card" : "Probability"} Mode</button>
                    </div>
                </div>
            </div>
            {classicDiceIsCardsMode && <div className="flex-container">
                <div>
                    <h3>Card Deck</h3>
                    <button onClick={clearCards}>Reshuffle Card Deck</button>
                </div>
                <div>
                    <h3>Reshuffle Threshold</h3>
                    <p className="small-p">The amount of cards that aren't used before the cards are reshuffled.</p>
                    <input type="number" min="0" max="35" value={cardShuffleThreshold} onChange={changeShuffleThreshold}></input>
                </div>
            </div>}
            {eventDiceIsCardsMode && <div className="flex-container">
                <div>
                    <h3>Event Card Deck</h3>
                    <button onClick={clearEventCards}>Reshuffle Event Card Deck</button>
                </div>
                <div>
                    <h3>Event Card Reshuffle Threshold</h3>
                    <p className="small-p">The amount of event cards that aren't used before the event cards are reshuffled.</p>
                    <input type="number" min="0" max="5" value={eventShuffleThreshold} onChange={changeEventShuffleThreshold}></input>
                </div>
            </div>}


            <div>
                <h3>Roll History</h3>
                <div><button onClick={toggleRollHistory}>{showRollHistory ? "Hide" : "Show"} Roll History</button></div>
                <br></br>
                <div><button onClick={clearRollHistory}>Clear Roll History</button></div>
            </div>
        </section>

        <section className="main-container">
            <h2>Simulation</h2>

            <button onClick={rollDice}>Roll Dice</button>
            {classicDiceIsCardsMode && <div className="flex-container">
                <div>
                    <h3>Cards</h3>
                    <p>{cards.length}</p>
                </div>
                {cardsIsShuffle && cardsLeftover.length != 0 && <div className="flex-container">
                    <h3>Cards left</h3>
                    <div id="leftover-list">
                        <ul>
                        {cardsLeftover.map((dice_pair, key) => {
                            return <DisplayDicePair pair={dice_pair} key={key} />;
                        })}
                        </ul>
                    </div>
                </div>}
            </div>}
            {eventDiceIsCardsMode && <div className="flex-container">
                <div>
                    <h3>Event Cards</h3>
                    <p>{eventCards.length}</p>
                </div>
                {eventCardsIsShuffle && eventCardsLeftover.length != 0 && <div className="flex-container">
                    <h3>Event Cards left</h3>
                    <div id="leftover-list">
                        <ul>
                        {eventCardsLeftover.map((dice_event, key) => {
                            return <DisplayDiceEvent event={dice_event} key={key} />;
                        })}
                        </ul>
                    </div>
                </div>}
            </div>}
            <div>
                <h3>Last Roll</h3>
                <DisplayDiceRoll roll={currentRoll}/>
            </div>

            <div className="flex-container" id="history-container">
                <h3>Roll History</h3>
                <p style={{display: showRollHistory ? "none" : "block"}}>Hidden</p>
                {showRollHistory && rollHistory.length == 0 ? <p>None</p> :
                <div style={{display: showRollHistory ? "flex" : "none"}} id="histogram-container">
                    <div id="histogram"></div>
                    <div id="history-list">
                        <ul>
                        {rollHistory.map((dice_roll, key) => {
                            return <DisplayDiceRoll roll={dice_roll} key={key} />;
                        })}
                        </ul>
                    </div>
                </div>}
            </div>
        </section>
      </main>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('container')
);

function DisplayDiceRoll(props) {
    //empty roll result
    if(props.roll == null) return <div>
        <p className="roll">None</p>
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
    if(props.pair == null) return <div>
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
    if(props.event == null) return <div>
        <p>None</p>
    </div>

    //show roll result
    return <div>
        <img className="dice" src={"assets/" + props.event + ".svg"} width="20"/>
    </div>
}
