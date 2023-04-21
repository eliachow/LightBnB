const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// console.log test:
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
//   let resolvedUser = null;
//   for (const userId in users) {
//     const user = users[userId];
//     // if (user?.email.toLowerCase() === email?.toLowerCase()) {
//     //   resolvedUser = user;
//     // }
//     // 👉below code re-written due to syntax error above.
//     if (user && email && user.email.toLowerCase() === email.toLowerCase()) {
//   resolvedUser = user;
// }
//   }
//   return Promise.resolve(resolvedUser);

return pool
  .query(`SELECT * FROM users WHERE email = $1`, [email])
  .then((result) => {
    // check if user exists
    if (result.rows.length === 0) {
      console.log("user does not exist")
      return null;
    } else {
      return result.rows[0];
    }
  })
  .catch((err) => {
    console.log("getUserWithEmail Error Message: ", err);
  })

};


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  // return Promise.resolve(users[id]);

  return pool
  .query(`SELECT * FROM users WHERE id = $1`, [id])
  .then((result) => {
    // check if user exists
    if (result.rows.length === 0) {
      console.log("user does not exist")
      return null;
    } else {
      return result.rows
    }
  })
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);

  return pool
  .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *` , [user.name, user.email, user.password])
  .then((result) => {
    // console.log("result: ", result)
    return result;
  })


};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  // return getAllProperties(null, 2);
console.log("👉👉👉guest_id: ", guest_id)
  return pool
  .query(`SELECT reservations.*, properties.*, property_reviews.*
  FROM reservations 
  JOIN properties ON reservations.property_id = properties.id 
  JOIN property_reviews ON properties.id = property_reviews.id
  WHERE reservations.guest_id = $1 
  GROUP BY properties.id, reservations.id, property_reviews.id
  ORDER BY reservations.start_date 
  LIMIT $2;`, 
  [guest_id, limit])
  .then((result) => {
    console.log("🎈🎈result: ", result.rows)
  return result.rows;
})
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  // const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  //   limitedProperties[i] = properties[i];
  // }
  // return Promise.resolve(limitedProperties);
  
  return pool
    .query(`SELECT * FROM properties LIMIT $1`,[limit])
    .then((result) => {
      // console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      // console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
