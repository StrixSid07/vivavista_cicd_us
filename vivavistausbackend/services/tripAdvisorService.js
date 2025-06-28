// const axios = require("axios");
// const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// // ✅ Function to Fetch TripAdvisor Data
// const fetchTripAdvisorData = async (locationId) => {
//   if (!locationId) return null;

//   try {
//     // Fetch basic hotel details
//     const detailsResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${locationId}/details`, {
//       headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//     });

//     const hotelData = detailsResponse.data;

//     // Fetch latest reviews (max 5)
//     const reviewsResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${locationId}/reviews`, {
//       headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//     });

//     const latestReviews = reviewsResponse.data.reviews.slice(0, 5).map((review) => ({
//       review: review.text,
//       rating: review.rating,
//     }));

//     // Fetch photos (max 5)
//     const photosResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${locationId}/photos`, {
//       headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//     });

//     const latestPhotos = photosResponse.data.photos.slice(0, 5).map((photo) => photo.images.large.url);

//     return {
//       rating: hotelData.rating,
//       reviews: hotelData.num_reviews,
//       latestReviews,
//       photos: latestPhotos,
//       link: hotelData.web_url,
//     };
//   } catch (error) {
//     console.error(`❌ Failed to fetch TripAdvisor data for locationId ${locationId}:`, error.message);
//     return null;
//   }
// };

// module.exports = { fetchTripAdvisorData };

//hello this is test commit

const axios = require("axios");
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// ✅ Function to Fetch TripAdvisor Data
const fetchTripAdvisorData = async (locationId) => {
  if (!locationId) {
    console.warn("⚠️ No locationId provided for TripAdvisor fetch.");
    return null;
  }

  const baseUrl = `https://api.content.tripadvisor.com/api/v1/location/${locationId}`;

  try {
    console.log(
      `📡 Fetching TripAdvisor details for locationId: ${locationId}`
    );

    // -------- Fetch Details --------
    let hotelData = {};
    try {
      const detailsResponse = await axios.get(`${baseUrl}/details`, {
        params: {
          key: TRIPADVISOR_API_KEY,
          language: "en",
        },
      });
      hotelData = detailsResponse.data;
      console.log("✅ TripAdvisor hotel details fetched.");
    } catch (err) {
      console.error("❌ Failed to fetch hotel details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      return null;
    }

    // -------- Fetch Reviews --------
    let latestReviews = [];
    try {
      const reviewsResponse = await axios.get(`${baseUrl}/reviews`, {
        params: {
          key: TRIPADVISOR_API_KEY,
          language: "en",
          limit: 5,
        },
      });
      console.log("rEVIW Raw TripAdvisor photo response:");
      console.dir(reviewsResponse.data, { depth: null });
      latestReviews = reviewsResponse.data.data.map((review) => ({
        review: review.text,
        rating: review.rating,
      }));
      console.log("✅ TripAdvisor reviews fetched.");
    } catch (err) {
      console.warn("⚠️ Could not fetch reviews:", {
        status: err.response?.status,
        message: err.message,
      });
    }

    // -------- Fetch Photos --------
    let latestPhotos = [];
    try {
      const photosResponse = await axios.get(`${baseUrl}/photos`, {
        params: {
          key: TRIPADVISOR_API_KEY,
          language: "en",
          limit: 5,
        },
      });
      console.log("📸 Raw TripAdvisor photo response:");
      console.dir(photosResponse.data, { depth: null });
      const rawPhotos = photosResponse.data?.data || [];

      latestPhotos = rawPhotos
        .map((photo) => {
          const images = photo.images || {};
          return (
            images.original?.url ||
            images.large?.url || // fallback
            images.medium?.url || // secondary fallback
            null
          );
        })
        .filter(Boolean); // remove nulls

      console.log("✅ TripAdvisor photos fetched:", latestPhotos);
    } catch (err) {
      console.warn("⚠️ Could not fetch photos:", {
        status: err.response?.status,
        message: err.message,
      });
    }

    return {
      rating: hotelData.rating || null,
      reviews: hotelData.num_reviews || 0,
      latestReviews,
      photos: latestPhotos,
      link: hotelData.web_url || "",
    };
  } catch (error) {
    console.error(
      `❌ Unexpected error while fetching TripAdvisor data for locationId ${locationId}:`,
      error.message
    );
    return null;
  }
};

module.exports = { fetchTripAdvisorData };
