function autocomplete(input, latinput, lnginput) {
  if(!input) return;

  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed',() => {
    const place = dropdown.getPlace();
    latinput.value = place.geometry.location.lat();
    lnginput.value = place.geometry.location.lng();
  });

  input.on('keydown', (e) => {
    if (e.keycode === 13) e.preventDefault();
  })
}

export default autocomplete;