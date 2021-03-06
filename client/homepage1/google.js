var map;
var service;
var infowindow;
function initalize() {
  var input = document.getElementById("searchTextField");
  var auto = new google.maps.places.Autocomplete(input);
}


const searchHandler = async e => {
  e.preventDefault();
  let coordinates = {
    lat: 0,
    long: 0
  };
  //deconstructing
  let { lat, long } = coordinates;

  let val = $("#searchTextField").val();
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${val}&key=AIzaSyBGWUB0Cw0-nco2gEEXETWFai3a-fpdtmM`;
  const result = await axios({
    method: "get",
    url: url
  });
  lat = result.data.results[0].geometry.location.lat;
  long = result.data.results[0].geometry.location.lng;
  initMap(lat, long);
};

function initMap(lat, long) {
  var coord = new google.maps.LatLng(lat, long);
  var val = $("#searchTextField").val();
  var radius = $("#radius-select").val();
  var meters = milesToMeters(radius);
 if(validateFields(radius)){
  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: lat,
      lng: long
    },
    zoom: 12
  });
  console.log(meters);
  var request = {
    location: coord,
    radius: meters,
    type: ["tourist_attraction"]
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callBack);
}
}
function callBack(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      console.log(place)
      renderCards(place);
      createMarker(place);
    }
  }
}
function createMarker(place) {
  infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  google.maps.event.addListener(marker, "click", function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}
const milesToMeters = mi => {
  return mi / 0.00062137;
};

const renderCards = place => {
  let photo = place.photos;
  let id = place.place_id;
  let html = 
  `
  <div class="column is-one-third">
    <div class="card" style="height:100%"> 

      <div class="card-image">
        <figure class="image is-4by3">
          <img id="image-${id}"src=${photo[0].getUrl()}>
        </figure>
      </div>

      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <p id="name-${id}"class="title is-4"> ${place.name} </p>
          </div>
        </div>
        <div class="content"> 
        <p class="address-label"> Address: </p>
        <a 
        href="https://www.google.com/maps/dir/?api=1&orgin=&destination=${place.name}&destination_place_id=${id}"
        id="addy-${id}"
        class="address"> 
        ${place.vicinity} 
        </a>
        <br>
        <br>
        <footer class="card-footer">
        <button id="${id}"class="button card-footer-item" class="favB" style="border-style:solid; padding-top: 10pt; padding-bottom: 20pt; padding-left:50pt; padding-right:50pt; background-color: white; border-color: pink; border-radius:20pt; margin-left: auto; margin-right: auto;"><i class="fas fa-heart"></i> Add to Favorites</button>
        </footer>
        </div>
      </div>
    </div>
  </div>
  `
  $('.columns').append(html)
};
const favoriteHandler = async e => {
  e.preventDefault();
  let cardId = e.target.id;
  var name = document.getElementById(`name-${cardId}`).innerHTML;
  var address = document.getElementById(`addy-${cardId}`).innerHTML;
  var picture = document.getElementById(`image-${cardId}`).src;
  var jwt = localStorage.getItem('jwt');
  axios.post('http://localhost:3000/user/favorite/location',
  {data:[name], type:"merge"}, {headers: {Authorization:`Bearer ${jwt}`}},{type: 'merge'})
  .then(response => {
      console.log(response.data);
  }).catch(error => {
      console.log(error);
  }); 
  
axios.post('http://localhost:3000/user/favorite/address',
  {data:[address], type:"merge"}, {headers: {Authorization:`Bearer ${jwt}`}},{type: 'merge'})
  .then(response => {
      console.log(response.data);
  }).catch(error => {
      console.log(error);
  });

axios.post('http://localhost:3000/user/favorite/image',
  {data:[picture], type:"merge"}, {headers: {Authorization:`Bearer ${jwt}`}},{type: 'merge'})
  .then(response => {
      console.log(response.data);
  }).catch(error => {
      console.log(error);
  });


}
const validateFields = val => {
  if(val == "") {
    alert('Please select an option!');
    return false;
  }
  return true;
}
google.maps.event.addDomListener(window, "load", initalize);
$("#location-search").on("click", searchHandler);
// $('#location-search').on('click' validateFields);
$('.columns').on('click','.button.card-footer-item', favoriteHandler);
