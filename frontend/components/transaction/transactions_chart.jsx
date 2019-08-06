import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


class TransactionsChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {transactions: [], portValues: []};
        this.portfolioData = this.portfolioData.bind(this);
        this.reformatPortData = this.reformatPortData.bind(this);
    }

    componentDidMount() {
        this.props.fetchTransactions().then((res) => this.setState(res, () => {
            debugger
            this.portfolioData("5d", "1")}));
    }

    portfolioData(timeframe, interval) {
        const {transactions} = this.state;
        let newPortValues = {};

        debugger

        Promise.all(transactions.map( (transaction) => {
            return this.props.fetchCompanyHistoricPrices(transaction.ticker, timeframe, interval)
                .then( (res) => {
                    const companyPrices = Object.assign([], res.prices);
                    companyPrices.forEach((price) => {
                        const priceTime = new Date(price.date);
                        const transactionTime = new Date(transaction.created_at);

                        if (this.priceWithinDayRange(priceTime, transactionTime)) {                          
                            if(newPortValues[price.date] === undefined) {
                                newPortValues[price.date] = 0;
                            }

                            if (transaction.buy) {
                                newPortValues[price.date] += (transaction.quantity * price.close);
                            } else {
                                newPortValues[price.date] -= (transaction.quantity * price.close);
                            }
                        }
                    });
                });
            })).then( () => {
                const notFormatted = newPortValues;
                const formatted = this.reformatPortData(newPortValues);
                debugger
        
                this.setState({portValues: formatted});
            });
    }

    reformatPortData(newPortValues){
        const chartData = [];
        debugger

        for(let i = 0; i < Object.keys(newPortValues).length; i++) {
            chartData.push( {time: Object.keys(newPortValues)[i], value: Object.values(newPortValues)[i]} );
        }
        debugger
        return chartData;
    }

    // priceWithinMonthRange(priceTime, transactionTime, monthRange){
    //     const priceMonth = priceTime.getMonth();
    //     const priceYear = priceTime.getYear();

    //     const month = transactionTime.getMonth();
    //     const year = transactionTime.getYear();

    //     if(priceYear === year) {
    //         return priceMonth - month <= monthRange ? true : false;
    //     } else if (year - priceYear === 1) {
    //         const newPriceMonth = priceMonth + 12;
    //         return newPriceMonth - month <= monthRange ? true : false; 
    //     }

    //     return false;
    // }

    priceWithinDayRange(priceTime, transactionTime){
        let priceMonth = priceTime.getMonth();
        let priceDate = priceTime.getDate() + 1;
        let priceYear = priceTime.getYear();

        const month = transactionTime.getMonth();
        const date = transactionTime.getDate();
        const year = transactionTime.getYear();

        // if(priceYear === year) {
        //     if(priceMonth === month) {
        //         return date <= priceDate + dayRange ? true : false;
        //     }
        // } else if (year - priceYear === 1) {
            
        //     return date <= priceDate + dayRange - 31 ? true : false;
        // }

        if (priceTime >= transactionTime || priceYear === year && priceMonth === month && priceDate === date) {
            return true;
        } else {
            return false;
        }
    }

    render(){
        const { portValues } = this.state;
        debugger
        return(
            <div>
                <ResponsiveContainer width='100%' aspect={7 / 2.0}>
                    <LineChart className="linechart" data={portValues}>

                        <Line type="monotone" stroke="#21CE99"
                            strokeWidth={2} dot={false} />

                        <XAxis hide={true} dataKey={portValues.time}/>
                        <YAxis type="number" domain={['dataMin', 'dataMax']} hide={true} />

                        <Tooltip className='tooltip'
                            contentStyle={{ border: '0', backgroundColor: 'transparent' }}
                            formatter={(value, name, props) => { return [""] }}
                            isAnimationActive={false} cursor={{ stroke: "Gainsboro", strokeWidth: 1.5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>     
            </div>
        );
    }
}


export default TransactionsChart;