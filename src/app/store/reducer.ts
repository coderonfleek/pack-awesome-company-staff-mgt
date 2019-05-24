const users = (state = [], action) => {
  switch (action.type) {
    case "LOAD_USERS":
      return (state = action.payload);

      break;
    case "ADD_USER":
      return [...state, action.payload];

    case "REMOVE_USER":
      return state.filter(user => user.id !== action.payload.id);
      break;

    case "UPDATE_USER":
      return state.map(user => {
        if (user.id == action.payload.id) {
          return action.payload;
        } else {
          return user;
        }
      });
      break;
    default:
      return state;
  }
};

export default users;
