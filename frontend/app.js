const DICE_DEFAULT = [1, 2, 3, 4, 5, 6];
const DICE_RED = [1, 2, 3, 4, 5, 6];
const DICE_EVENT = ['B', 'B', 'B', 'y', 'b', 'g'];

//ids should be indices
const MODES = [
    {id: 0, value: "Probability Distribution Mode"},
    {id: 1, value: "Card Mode"},
    {id: 2, value: "Card Mode (All Dice)"}
];

//TODO
// --> all dice and event dice only
//allow to choose if default and red are probability or card mode
//and allot to choose if event is prob or card mode

//histogram for all modes actually

//toggle showing roll history
//save roll history when page reloaded
// --> clear roll history

//use dice sprites

//clear histoies on mode change

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

function shuffle(array) {
    //shuffle array randomly
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
    const [gameModeId, setGameModeId] = React.useState(MODES[0].id);
    const [currentRoll, setCurrentRoll] = React.useState(null);

    const [rollHistory, setRollHistory] = React.useState([]);
    const [showRollHistory, setShowRollHistory] = React.useState(true);

    const [cards, setCards] = React.useState(shuffleCards);
    const [shuffleThreshold, setShuffleThreshold] = React.useState(5);

    const [eventCards, setEventCards] = React.useState(shuffleEventCards);
    const [eventShuffleThreshold, setEventShuffleThreshold] = React.useState(0);


    //load cards into local storage every time it gets updated
    /*React.useEffect(() => {
        let stored = JSON.parse(window.localStorage.getItem('cards'));

        console.log((stored == null ? "null" : stored.length), cards.length);
        if(stored == null || stored.length == cards.length + 1) window.localStorage.setItem('cards', JSON.stringify(cards));

        stored = JSON.parse(window.localStorage.getItem('cards'));
        console.log(stored, cards)

        //if storage has less cards than cards -> read from storage
    },  [cards]);*/

    React.useEffect(() => {
        showHistogram();
    }, [rollHistory]);

    function changeMode(event) {
        let id = event.target.value;

        setGameModeId(id);
    }

    function changeShuffleThreshold(event) {
        setShuffleThreshold(parseInt(event.target.value));
    }

    function changeEventShuffleThreshold(event) {
        setEventShuffleThreshold(parseInt(event.target.value));
    }

    function clearCards(event) {
        //if(!confirm("Are you sure you want to clear the roll history? The data cannot be retrieved. This reshuffles the cards, if you are using a card mode.")) return;

        //force reshuffle
        setCards(shuffleCards);

        //clearRollHistory();

        //clear history from localStorage
        //window.localStorage.removeItem('cards');
    }

    function toggleRollHistory(event) {
        setShowRollHistory(!showRollHistory);
    }

    function clearRollHistory(event) {
        setRollHistory([]);
    }

    function rollDice(event) {
        let roll;

        if(gameModeId == 0) {
            let d = randElement(DICE_DEFAULT);
            let r = randElement(DICE_RED);
            let dice_event = randElement(DICE_EVENT);

            let pair = new dicePair(d, r);
            roll = new diceRoll(pair, dice_event);
        } else {
            /*let storage = JSON.parse(window.localStorage.getItem('cards'));
            if(storage.length != cards.length) {
                console.log(storage.length, cards.length);
                setCards(storage);
            }*/

            let pair = cards[cards.length - 1];
            let dice_event = randElement(DICE_EVENT);

            if(gameModeId == 2) {
                //make event dice card based as well
                dice_event = eventCards[eventCards.length - 1];

                if(eventCards.length - 1 === eventShuffleThreshold) setEventCards(shuffleEventCards);
                else setEventCards([...eventCards].slice(0, -1));
            }

            roll = new diceRoll(pair, dice_event);

            //if card length reaches threshold they are reshuffled
            if(cards.length - 1 === shuffleThreshold) setCards(shuffleCards);
            else setCards([...cards].slice(0, -1));  //update cards (pop off last element)
        }

        setCurrentRoll(roll);
        setRollHistory([roll, ...rollHistory]);
    }

    function showHistogram() {
        if(document.getElementById('histogram') == null) return;

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
        };

        var data = [trace];
        let layout = {
            title: "Statistic of " + rollHistory.length + " Roll" + (rollHistory.length == 1 ? "" : "s"),
            bargap: 0.02
        }
        Plotly.newPlot('histogram', data, layout);
    }

    return (
      <main>
        <section className="main-container">
            <h1>Catan Dice Roll Simulation</h1>
            <h2>Parameters</h2>
            <div>
                <h3>Dice Mode</h3>
                <p className="small-p">The mode of dice rolls.</p>
                <select onChange={changeMode}>
                    {MODES.map((mode, key) => {
                        return <option value={mode.id} key={key}>{mode.value}</option>
                    })}
                </select>
            </div>
            {gameModeId != 0 && <div>
                <h3>Reshuffle Threshold</h3>
                <p className="small-p">The amount of cards that aren't used before the cards are reshuffled.</p>
                <input type="number" min="0" max="36" value={shuffleThreshold} onChange={changeShuffleThreshold}></input>
            </div>}
            {gameModeId == 2 && <div>
                <h3>Event Card Reshuffle Threshold</h3>
                <p className="small-p">The amount of event cards that aren't used before the event cards are reshuffled.</p>
                <input type="number" min="0" max="6" value={eventShuffleThreshold} onChange={changeEventShuffleThreshold}></input>
            </div>}
            {gameModeId != 0 && <div>
                <h3>Card Deck</h3>
                <div><button onClick={clearCards}>Clear Card Deck</button></div>
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
            {gameModeId != 0 && <div>
                <h3>Cards</h3>
                <p>{cards.length}</p>
            </div>}
            {gameModeId == 2 && <div>
                <h3>Event Cards</h3>
                <p>{eventCards.length}</p>
            </div>}
            <div>
                <h3>Last Roll</h3>
                <ShowRoll show_sum="true" roll={currentRoll}/>
            </div>

            <div className="flex-container">
                <h3>Roll History</h3>
                <p style={{display: showRollHistory ? "none" : "block"}}>Hidden</p>
                {showRollHistory && rollHistory.length == 0 ? <p>None</p> :
                <div style={{display: showRollHistory ? "flex" : "none"}} id="history-container">
                    <div id="histogram"></div>
                    <div id="history-list">
                        <ul>
                        {rollHistory.map((dice_roll, key) => {
                            return <ShowRoll roll={dice_roll} key={key} />;
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

function ShowRoll(props) {
    //empty roll result
    if(props.roll == null) return <div>
        <p className="roll">None</p>
    </div>

    //show roll result
    return <div>
        <p className="roll">
            {props.roll.dice_default} 
            <span style={{color: "red"}}> {props.roll.dice_red} </span> 
            <span style={{color: 
                props.roll.dice_event == 'B' ? "black" : 
                props.roll.dice_event == 'y' ? "yellow" :
                props.roll.dice_event == 'b' ? "blue" : "green"
                }}>{'\u2588'}</span>
        </p>
        {props.show_sum && <p className="roll">{props.roll.sum}</p>}
    </div>
}