import React from 'react';
import { withRouter } from 'react-router-dom';
import NumberFormat from 'react-number-format';

class BuySell extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buy: true,
            quantity: "",
            watchlistTickers: [],
            watchlistIdTicker: {},
            watchStatus: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.buySellSwitch = this.buySellSwitch.bind(this);
        this.clearErrors = this.clearErrors.bind(this);
        this.deposit = this.deposit.bind(this);
        this.redirectPortfolioPage = this.redirectPortfolioPage.bind(this);
        this.addWatchlist = this.addWatchlist.bind(this);
        this.deleteWatchlist = this.deleteWatchlist.bind(this);
    }

    componentDidMount() {
        const watchlistTickers = [];
        const watchlistIdTicker = {}
        const ticker = this.props.match.params.ticker;

        this.props.fetchWatchlist().then( (watchlistObj) => {
            Promise.all(Object.values(watchlistObj.watchlist).map((item) => {
                watchlistTickers.push(item.company_id);
                watchlistIdTicker[item.company_id] = item.id
            })).then( () => {
                const watchStatus = watchlistTickers.includes(ticker) ? true : false;

                this.setState({
                    watchlistTickers: watchlistTickers,
                    watchStatus: watchStatus,
                    watchlistIdTicker: watchlistIdTicker,
                });
            })
        });
    }

    update(field) {
        return e => this.setState({
            [field]: e.currentTarget.value
        });
    }

    componentDidUpdate(prevProps) {
        const watchlistTickers = [];
        const watchlistIdTicker = {}
        const ticker = this.props.match.params.ticker;

        if (this.props.match.params.ticker !== prevProps.match.params.ticker) {
            this.props.fetchWatchlist().then((watchlistObj) => {
                Promise.all(watchlistObj.watchlist.map((item) => {
                    watchlistTickers.push(item.company_id);
                    watchlistIdTicker[item.company_id] = item.id
                })).then(() => {
                    const watchStatus = watchlistTickers.includes(ticker) ? true : false;
                    this.setState({
                        buy: true,
                        quantity: "",
                        errors: false,
                        watchlistTickers: watchlistTickers,
                        watchlistIdTicker: watchlistIdTicker,
                        watchStatus: watchStatus,
                    });
                })
            });
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const transaction = {
            buy: this.state.buy,
            purchase_price: this.props.mostRecentPrice.average,
            quantity: this.state.quantity,
            ticker: this.props.match.params.ticker,
        }

        const validTransaction = this.validTransaction(transaction);
    
        if (!validTransaction[0] && !validTransaction[1]) {
            this.props.createTransaction(transaction).then( () => {
                this.redirectPortfolioPage();
            });
            
        } else {
            this.setState({
                fundError: validTransaction[0],
                ownError: validTransaction[1],
            })
        }
    }

    redirectPortfolioPage() {
        this.props.history.push('/');
    }

    checkError() {
        let errorObj = null;
        const icon = <i className="fas fa-exclamation-circle"></i>;

        let cost = Math.round(this.props.mostRecentPrice.average * this.state.quantity * 100) / 100;

        let deposit = Math.round((cost - this.props.balance) * 100) / 100
        let formattedDeposit = <NumberFormat value={deposit} displayType={'text'} thousandSeparator={true} prefix={'$'} />

        let formattedQuantity = <NumberFormat value={this.state.quantity} displayType={'text'} thousandSeparator={true} />

        if (this.state.fundError) {
            errorObj = (
                <div>
                    <div>{icon} Not Enough Buying Power</div>
                    <p>Please deposit {formattedDeposit} to purchase {formattedQuantity} shares at market price.</p>

                    <div className="error-buttons">
                        <button className="deposit" onClick={this.deposit}>Deposit {formattedDeposit}</button>
                        <button className="back" onClick={this.clearErrors}>Back</button>
                    </div>
                </div>
            )
        } else if (this.state.ownError) {
            errorObj = (
                <div>
                    {icon} Insufficient number of shares. 
                    <div className="error-buttons">
                        <button className="back" onClick={this.clearErrors}>Back</button>
                    </div>
                </div>
            )
        }
        return errorObj
    }

    renderErrors() {
        if(this.state.fundError || this.state.ownError) {
            return (
                <div className="invalid-buy-credentials">
                    <div className="error-text">
                        {this.checkError()}
                    </div>
                </div>
            );
        } else {
            return(
                <input className="review-order" type="submit" value="Order" />
            );
        }
    }

    clearErrors() {
        this.setState({
            fundError: false,
            ownError: false,
        })
    }

    componentWillUnmount() {
        this.clearErrors();
    }

    buySellSwitch(purchase) {
        if(purchase === "buy") {
            this.setState({
                "buy": true,
            });
        } else {
            this.setState({ 
                "buy": false,
            });
        }
    }

    numShares() {
        const transactions = this.props.transactions;
        const ticker = this.props.match.params.ticker;
        let numShares = 0;

        for (let i = 0; i < transactions.length; i++) {
            let transaction = transactions[i];

            if(transaction["ticker"] === ticker) {
                numShares = transaction["buy"] === true ? numShares + transaction["quantity"] : numShares - transaction["quantity"];
            }
        }
        return numShares;
    }

    deposit() {
        const cost = this.props.mostRecentPrice.average * this.state.quantity;
        const deposit = cost - this.props.balance;
        const currentUser = this.props.current_user;
        this.props.updateBalance(currentUser, deposit);
        this.setState({
            fundError: false,
            ownError: false,
        })
    }

    validTransaction(transaction) {
        let fundError = false;
        let ownError = false;

        if(transaction["buy"]) {
            fundError = this.props.balance >= transaction["purchase_price"] * transaction["quantity"] ? false : true;
        } else {
            ownError = this.numShares() >= transaction["quantity"] ? false : true;
        }

        return [fundError, ownError];
    }

    addWatchlist() {
        const ticker = this.props.match.params.ticker;
        const companyWatchlistId = this.state.watchlistIdTicker[ticker];

        this.props.createWatchlistItem({user_id: this.props.current_user.id, ticker: ticker});

        this.setState({
            watchStatus: true,
        })
    }

    deleteWatchlist() {
        const ticker = this.props.match.params.ticker;
        const companyWatchlistId = this.state.watchlistIdTicker[ticker];

        this.props.deleteWatchlistItem(companyWatchlistId);
        console.log(this.state.watchStatus);

        this.setState({
            watchStatus: false,
        }, () => console.log(this.state.watchStatus));

    }

    render() {
        const { watchStatus } = this.state;

        const mostRecentPrice = this.props.mostRecentPrice.average || '';
        const mostRecentCost = this.props.mostRecentPrice.average * this.state.quantity || '';
        const formattedCost = <NumberFormat value={Math.round(mostRecentCost * 100) / 100} displayType={'text'} thousandSeparator={true} prefix={'$'} />
        const balance = this.props.balance;
        
        const watchButton = watchStatus ? 
            <button className="watching" onClick={this.deleteWatchlist}>Remove from Watchlist</button> :
            <button className="notwatching" onClick={this.addWatchlist}>Add to Watchlist</button> 

        return(
            <div className="form-watchlist">
                <div className="buy-sell-info">

                    <div className="buy-sell-but">
                        <button onClick={() => this.buySellSwitch("buy")}>{"Buy " + this.props.match.params.ticker}</button>
                        <button onClick={() => this.buySellSwitch("sell")}>{"Sell " + this.props.match.params.ticker}</button>
                    </div>

                    <form className="bs-form" onSubmit={this.handleSubmit}>
                        <div className="shares">
                            <label>Shares</label>
                            <input type="number"
                                min="0"
                                step="1"
                                onChange={this.update('quantity')}
                                placeholder="0"
                                value={this.state.quantity}
                                required
                            />
                        </div>

                        <div className="market-price">
                            <label>Market Price</label>
                            <label>${Math.round(mostRecentPrice * 100) / 100}</label>
                        </div>

                        <div className="estimated-cost">
                            <label>Estimated Cost</label>
                            <label>{formattedCost}</label>
                        </div>

                        {this.renderErrors()}

                        <div className="buying-power">
                            <label>${Math.round(balance * 100) / 100} Buying Power Available</label>
                        </div>
                    </form>
                </div>

                <div className="watchlist-toggle-div">
                    { watchButton }
                </div>
            </div>
            
        );
    }
}

export default withRouter(BuySell);