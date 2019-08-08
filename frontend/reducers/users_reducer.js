import { RECEIVE_CURRENT_USER } from '../actions/session_actions';
import { RECEIVE_TRANSACTION } from '../actions/transactions_actions';

const usersReducer = (state = {}, action) => {
    Object.freeze(state);
    switch(action.type){
        case RECEIVE_CURRENT_USER:
            return Object.assign({}, state, {[action.currentUser.id]: action.currentUser});
        case RECEIVE_TRANSACTION:
            const user_id = action.transaction.user_id;
            const oldPortVal = state[user_id].portfolio_value;
            const oldBalance = state[user_id].balance;

            let newBalance = "";
            let newPortVal = "";

            const totalPrice = action.transaction.quantity * action.transaction.purchase_price;

            if (action.transaction.buy) {
                newBalance = oldBalance - totalPrice;
                newPortVal = oldPortVal + totalPrice;
            } else {
                newBalance = oldBalance + totalPrice;
                newPortVal = oldPortVal - totalPrice;
            }
            
            const newUser = Object.assign({}, state[user_id]);
            newUser.portfolio_value = newPortVal;
            newUser.balance = newBalance;

            return Object.assign({}, state, {[user_id]: newUser});
        default:
            return state;
    }
}

export default usersReducer;