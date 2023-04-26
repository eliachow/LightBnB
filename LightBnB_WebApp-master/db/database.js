const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {

  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
    // check if user exists
      if (result.rows.length === 0) {
        console.log("user does not exist");
        return null;
      } else {
        return result.rows[0];
      }
    })
    .catch((err) => {
      console.log("getUserWithEmail Error Message: ", err);
    });

};


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {

  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
    // check if user exists
      if (result.rows.length === 0) {
        console.log("user does not exist");
        return null;
      } else {
        return result.rows;
      }
    });

};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {

  return pool
    .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`, [user.name, user.email, user.password])
    .then((result) => {
      return result.rows[0];
    });

};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  
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
      return result.rows;
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  // parameters options passed from the query
  const queryParams = [];
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating 
    FROM properties 
    JOIN property_reviews ON properties.id = property_id
  `;
  const min = options.minimum_price_per_night;
  const max = options.maximum_price_per_night;

  // check if city has been passed as an option
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  // return propererties within min/max range
  if (min && max) {
    queryParams.push(`${min}`);
    queryString +=  `AND (properties.cost_per_night / 100) >= $${queryParams.length} `;
    queryParams.push(`${max}`);
    queryString += `AND (properties.cost_per_night / 100) < $${queryParams.length} `;
    console.log("min: ", min);
    console.log("max: ", max);
  }

  // return avg min rating
  let havingRating = ``;
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    havingRating += `HAVING Avg(property_reviews.rating) >= $${queryParams.length}`
  }

  // check if owner_id has been passed to filter to their properties only
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `WHERE properties.owner_id = $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ${havingRating}
  ORDER BY cost_per_night 
  LIMIT $${queryParams.length};
  `;

  
  return pool
    .query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  return pool
    .query(`INSERT INTO properties (
    title, 
    description, 
    thumbnail_photo_url, 
    cover_photo_url, 
    cost_per_night, 
    street, 
    city, 
    province, 
    post_code, 
    country, 
    parking_spaces, 
    number_of_bathrooms,  
    number_of_bedrooms) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [property.title,
      property.description,
      property.thumbnail_photo_url,
      property.cover_photo_url,
      property.cost_per_night,
      property.street,
      property.city,
      property.province,
      property.post_code,
      property.country,
      property.parking_spaces,
      property.number_of_bathrooms,
      property.number_of_bedrooms])
    .then((result) => {
      return result.rows;
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
