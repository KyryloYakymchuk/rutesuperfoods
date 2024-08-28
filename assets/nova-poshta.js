function NovaPoshtaMain() { 
  const apiKey            = NP_API_KEY;
  const endpointNP        = 'http://api.novaposhta.ua/v2.0/json/';
  const country           = 'Ukraine';
  const provider          = 'Нова пошта';
  const quickIndices      = quickCityIndices.split(' ');
  const bodyNP            = document.getElementById('nova-poshta');
  const deliveryVariants  = document.getElementById('deliveryVariants');

  const deliveryTypes     = document.querySelectorAll('input[type="radio"][name="id"]');
  let deliveryType        = deliveryTypes[0].getAttribute('data-type');
  let isDelivery          = false;
  // Wraps
  const wrapWarehouse     = document.querySelector('.warehouse-wrap');
  const wrapAddresses     = document.querySelector('.address-wrap');
  // Inputs
  const inputCity         = document.getElementById('city-search');
  const inputWarehouse    = document.getElementById('warehouse-search');
  const inputStreet       = document.getElementById('address-street');
  const inputBuild        = document.getElementById('address-build');
  const inputFlat         = document.getElementById('address-flat');
  const inputFields       = document.querySelectorAll('.form-group input');
  const filterFields      = document.querySelectorAll('.dropdown-filter');

  const buttonShipping    = document.querySelector('[data-name="shipping"]');  
  const cartDraver        = document.querySelector('.qsc2-drawer');
  const cityErrorEl       = document.querySelector('.city-wrap .input-error'); 
  const warehouseErrorEl  = document.querySelector('.warehouse-wrap .input-error');
  const streetErrorEl     = document.querySelector('.address-wrap .input-error');
  const clearCity         = document.querySelector(".city-wrap .clear");
  const clearWarehouse    = document.querySelector(".warehouse-wrap .clear");
  const clearStreet       = document.querySelector(".form-street .clear");
  const cartUrl           = deliveryVariants.getAttribute('data-carturl');
  const properties        = {_provider: provider, _country: country};

  let dataCities, dataWarehouses, dataStreet, addressCity, addressZip, addressStreet, addressBuild, addressFlat, cityData, warehouseData;
  wrapWarehouse.classList.add('d-none');    
  wrapAddresses.classList.add('d-none'); 
  checkoutButton.classList.add('disabled');
  checkoutButtonWrapper.classList.add('tool');
  checkoutButton.disabled = true;
  /*== shipping notifications ==*/
  function btnHover() {  
    checkoutButtonWrapper.addEventListener("mouseover", (event) => {
      if(checkoutButtonWrapper.classList.contains('tool')) {
        buttonShipping.classList.add('button-hover');
      }
    })
    checkoutButtonWrapper.addEventListener("mouseout", (event) => {        
      if(checkoutButtonWrapper.classList.contains('tool')) {
        buttonShipping.classList.remove('button-hover');
      }
    })
  }
  /*== update cart note  ==*/
  async function updateCartNote() {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        body: JSON.stringify({note: "null"}),
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  }
  if(pageType == 'sidebar') btnHover();

  /*== Error API ==*/
  function errorAPI() {
    document.querySelector('.checkout-button-wrap').classList.remove('tool');
    console.log('error');
    /*== check selected delivery type ==*/
    fetch(`${cartUrl}.json`).then(response => response.json()).then(data => {

      wrapWarehouse.classList.add('d-none');    
      wrapAddresses.classList.add('d-none');
      //alert('1');

      if (data.attributes._delivery_type) {
        isDelivery = true;
        deliveryVariants.setAttribute('data-variant', data.attributes._delivery_type);
        if(cartDraver) cartDraver.setAttribute('data-delivery', data.attributes._delivery_type);
        document.querySelector('input[type="radio"][name="id"][data-type='+data.attributes._delivery_type+']').checked=true;
        deliveryType = data.attributes._delivery_type;
        
        if(deliveryType == 'courier') {

          filterExclusion = '-1';
          wrapAddresses.classList.remove('d-none');
          properties._delivery_method  = methodCourier;
          checkoutButton.disabled = false;
          checkoutButtonWrapper.classList.remove('tool');
          if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = methodCourier;

        } else {

          filterExclusion = '0';
          wrapWarehouse.classList.remove('d-none');
          properties._delivery_type = deliveryType;
          properties._delivery_method = methodBranch;

        }
      }    
      if (!isDelivery) {
        if(cartDraver) cartDraver.setAttribute('data-delivery', deliveryType);
        wrapWarehouse.classList.remove('d-none');
        properties._delivery_type = deliveryType;
        properties._delivery_method = methodBranch;        
        filterExclusion = '0';     
      }
      
      properties._delivery_courier_address              = null;
      properties._delivery_street                       = null;
      properties._delivery_house                        = null;
      properties._delivery_flat                         = null;
      properties._delivery_street_Ref                   = null;
      properties._delivery_city                         = null;
      properties._delivery_city_Area                    = null;
      properties._delivery_city_Ref                     = null;
      properties._delivery_warehouse                    = null;
      properties._delivery_warehouse_zip                = null;
      properties._delivery_warehouse_name               = null;
      properties._delivery_warehouse_address            = null;
      properties._delivery_warehouse_CityRef            = null;
      properties._delivery_warehouse_Number             = null;
      properties._delivery_warehouse_Ref                = null;
      properties._delivery_warehouse_SettlementRef      = null;
      properties._delivery_warehouse_TypeOfWarehouse    = null;

      updateCartDeliveryAttr(properties);
      
    
        //updateCartNote();

    }) 
    /*== check changes delivery type ==*/
    deliveryTypes.forEach(function(el){
      el.addEventListener("change", function(){
        deliveryType = this.getAttribute('data-type');
        wrapWarehouse.classList.add('d-none');    
        wrapAddresses.classList.add('d-none');
        inputFields.forEach(function(e){ e.value = '';})
        cityErrorEl.innerHTML = '';
        warehouseErrorEl.innerHTML = '';
        streetErrorEl.innerHTML = '';
        

        properties._delivery_type = deliveryType;
        if(cartDraver) cartDraver.setAttribute('data-delivery', deliveryType);
        if (deliveryType == 'branch') {
          properties._delivery_method = methodBranch;
          wrapWarehouse.classList.remove('d-none');
          if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = titleDelivery;
        } else {
          properties._delivery_method = methodCourier;
          wrapAddresses.classList.remove('d-none');
          checkoutButton.classList.remove('disabled');
          checkoutButton.disabled = false;
          if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = methodCourier;
        }
        properties._delivery_courier_address              = null;
        properties._delivery_street                       = null;
        properties._delivery_house                        = null;
        properties._delivery_flat                         = null;
        properties._delivery_street_Ref                   = null;
        properties._delivery_city                         = null;
        properties._delivery_city_Area                    = null;
        properties._delivery_city_Ref                     = null;
        properties._delivery_warehouse                    = null;
        properties._delivery_warehouse_zip                = null;
        properties._delivery_warehouse_name               = null;
        properties._delivery_warehouse_address            = null;
        properties._delivery_warehouse_CityRef            = null;
        properties._delivery_warehouse_Number             = null;
        properties._delivery_warehouse_Ref                = null;
        properties._delivery_warehouse_SettlementRef      = null;
        properties._delivery_warehouse_TypeOfWarehouse    = null;
        updateCartDeliveryAttr(properties).then(function() {/*console.log(cart)*/}).catch(alert);     
      })
    })
    /*== update cart attribute  ==*/
    async function updateCartDeliveryAttr(data) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        body: JSON.stringify({ attributes: data}),
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } catch (error) {
      throw error;
    }
    }
    checkoutButton.addEventListener('click', async function(e) {

      let shouldDisable = true;	
      if (shouldDisable) this.classList.add('disabled');
      
      e.preventDefault();
      this.disabled = true; 
      
      
      addressStreet = addressCity = addressWarehouse = false;
      if(inputStreet.value) addressStreet = 'вул.'+inputStreet.value; //(addressStreet)?addressStreet:'';
      if(inputBuild.value) addressStreet = addressStreet +' буд.'+inputBuild.value;
      if(inputFlat.value) addressStreet = addressStreet +' кв.'+inputFlat.value;
      if(inputCity.value) addressCity = inputCity.value; //(addressCity)?addressCity:'';
      if(inputWarehouse.value) addressWarehouse = inputWarehouse.value;      
      addressZip = '12345';

      properties._delivery_courier_address              = (addressStreet != false ) ? addressStreet : null;
      properties._delivery_city                         = (addressCity != false ) ? addressCity : null;
      properties._delivery_warehouse_zip                = addressZip;
      properties._delivery_warehouse_Number             = (addressWarehouse != false ) ? addressWarehouse : null;

      updateCartDeliveryAttr(properties);   

      let addr_delivery_courier_address              = (addressStreet != false ) ? addressStreet : '';
      let addr_delivery_city                         = (addressCity != false ) ? addressCity : '';
      let addr_delivery_warehouse_Number             = (addressWarehouse != false ) ? addressWarehouse : '';

      const address = ({
        address1: (deliveryType == 'branch') ? 'відділення/поштомат '+addr_delivery_warehouse_Number : addr_delivery_courier_address+' ('+methodCourier+')',
        zip: addressZip, 
        city: addr_delivery_city,
        country: country
      });
      
      setTimeout( function() {
      fetch(`${cartUrl}.json`).then(response => response.json()).then(data => {
          const pairs = [];
          
          const path = data.items.map(item => {
            return `${item.variant_id}:${item.quantity}`;
          }).join(',');

          for (var key in properties) {
            const value = properties[key];

            if (!value) continue;

            const pair = `attributes[${key}]=${properties[key]}`;

            pairs.push(pair);
          }

          for (var key in address) {
            const value = address[key];

            if (!value) continue;

            const pair = `checkout[shipping_address][${key}]=${address[key]}`;

            pairs.push(pair);
          }

          let query;
          let url;
          if (data.note && data.note != null) {
          query = pairs.join('&') + `&note=${data.note}`;
          url = `${cartUrl}/${path}?${query}`;
          } else {
          query = pairs.join('&');  
          url = `${cartUrl}/${path}?${query}`;
          }

          
          window.location.href = url;

        })
        
      
      
      },200); 
        
    });
  }

  /*== Request API ==*/
  async function reqAPI(data) {
    try {
      const response = await fetch(endpointNP, {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } catch (error) {
      //throw error;
      console.log('error');      
    }
  } 

reqAPI({"apiKey": apiKey,"modelName": "Address","calledMethod": "searchSettlements","methodProperties": {"CityName" : quickIndices[0],"Limit" : "1","Page" : "1"}})
.then(res => { 
  
  //console.log(res.success);

  if (res.success) {

    /*== check selected delivery type ==*/
    fetch(`${cartUrl}.json`).then(response => response.json()).then(data => {

      wrapWarehouse.classList.add('d-none');    
      wrapAddresses.classList.add('d-none');
      //alert('1');

      if (data.attributes._delivery_type) {
        isDelivery = true;
        deliveryVariants.setAttribute('data-variant', data.attributes._delivery_type);
        if(cartDraver) cartDraver.setAttribute('data-delivery', data.attributes._delivery_type);
        document.querySelector('input[type="radio"][name="id"][data-type='+data.attributes._delivery_type+']').checked=true;
        deliveryType = data.attributes._delivery_type;
        
        if(deliveryType == 'courier') {

          filterExclusion = '-1';
          wrapAddresses.classList.remove('d-none');
          properties._delivery_method  = methodCourier;
          checkoutButton.disabled = false;
          checkoutButtonWrapper.classList.remove('tool');
          if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = methodCourier;

        } else {

          filterExclusion = '0';
          wrapWarehouse.classList.remove('d-none');
          properties._delivery_type = deliveryType;
          properties._delivery_method = methodBranch;

        }
      }    
      if (!isDelivery) {
        if(cartDraver) cartDraver.setAttribute('data-delivery', deliveryType);
        wrapWarehouse.classList.remove('d-none');
        properties._delivery_type = deliveryType;
        properties._delivery_method = methodBranch;        
        filterExclusion = '0';     
      }
      
      properties._delivery_courier_address              = null;
      properties._delivery_street                       = null;
      properties._delivery_house                        = null;
      properties._delivery_flat                         = null;
      properties._delivery_street_Ref                   = null;
      properties._delivery_city                         = null;
      properties._delivery_city_Area                    = null;
      properties._delivery_city_Ref                     = null;
      properties._delivery_warehouse                    = null;
      properties._delivery_warehouse_zip                = null;
      properties._delivery_warehouse_name               = null;
      properties._delivery_warehouse_address            = null;
      properties._delivery_warehouse_CityRef            = null;
      properties._delivery_warehouse_Number             = null;
      properties._delivery_warehouse_Ref                = null;
      properties._delivery_warehouse_SettlementRef      = null;
      properties._delivery_warehouse_TypeOfWarehouse    = null;

      updateCartDeliveryAttr(properties);   
      
        //updateCartNote();
    }) 
    /*== check changes delivery type ==*/
    deliveryTypes.forEach(function(el){
      el.addEventListener("change", function(){
        deliveryType = this.getAttribute('data-type');
        wrapWarehouse.classList.add('d-none');    
        wrapAddresses.classList.add('d-none');
        checkoutButtonWrapper.classList.add('tool');
        inputFields.forEach(function(e){ e.value = '';})
        cityErrorEl.innerHTML = '';
        warehouseErrorEl.innerHTML = '';
        streetErrorEl.innerHTML = '';
        filterFields.forEach(function(f){ 
          while(f.firstChild){ filter.removeChild(filter.firstChild);}
        });

        properties._delivery_type = deliveryType;
        if(cartDraver) cartDraver.setAttribute('data-delivery', deliveryType);
        if (deliveryType == 'branch') {
          properties._delivery_method = methodBranch;         
          filterExclusion = '0';         
          wrapWarehouse.classList.remove('d-none');
          if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = titleDelivery;
        } else {
          properties._delivery_method = methodCourier;        
          filterExclusion = '-1';         
          wrapAddresses.classList.remove('d-none');
          checkoutButton.classList.remove('disabled');
          checkoutButtonWrapper.classList.remove('tool');
          checkoutButton.disabled = false;
          if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = methodCourier;
        }
        properties._delivery_courier_address              = null;
        properties._delivery_street                       = null;
        properties._delivery_house                        = null;
        properties._delivery_flat                         = null;
        properties._delivery_street_Ref                   = null;
        properties._delivery_city                         = null;
        properties._delivery_city_Area                    = null;
        properties._delivery_city_Ref                     = null;
        properties._delivery_warehouse                    = null;
        properties._delivery_warehouse_zip                = null;
        properties._delivery_warehouse_name               = null;
        properties._delivery_warehouse_address            = null;
        properties._delivery_warehouse_CityRef            = null;
        properties._delivery_warehouse_Number             = null;
        properties._delivery_warehouse_Ref                = null;
        properties._delivery_warehouse_SettlementRef      = null;
        properties._delivery_warehouse_TypeOfWarehouse    = null;
        updateCartDeliveryAttr(properties).then(function() {/*console.log(cart)*/}).catch(alert);     
      })
    })
    /*== update cart attribute  ==*/
    async function updateCartDeliveryAttr(data) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        body: JSON.stringify({ attributes: data}),
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } catch (error) {
      throw error;
    }
    }
    /*== hover on checkout button ==*/
    if(pageType == 'sidebar') {
      checkoutButton.addEventListener("mouseover", () => {    
          buttonShipping.classList.add('button-checkout-hover');
      })
      checkoutButton.addEventListener("mouseout", () => {     
          buttonShipping.classList.remove('button-checkout-hover');      
      })
    }
    /*== text input clear ==*/
    document.querySelectorAll(".clear").forEach(function(el, index){
        el.addEventListener('click', function() {
          document.querySelectorAll(".form-group input")[index].value = '';
          document.querySelectorAll(".form-group input")[index].readOnly = false;
          if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = titleDelivery;
          document.querySelectorAll(".form-group input")[index].focus();
          this.classList.add('d-none');
          if(index == 0) {
            document.querySelectorAll(".form-group").forEach(function(el) {
              el.querySelector('input').value = '';
              el.querySelector('.clear') ? el.querySelector('.clear').classList.add('d-none') : null;
              el.querySelector("input").readOnly = false;
            })
          }
          if (deliveryType == 'branch')  checkoutButtonWrapper.classList.add('tool');
          filterFields.forEach(function(f){clearList(f)});
          bodyNP.classList.remove('filter-active');
          warehouseErrorEl.innerHTML = '';
          cityErrorEl.innerHTML = ''; 
          streetErrorEl.innerHTML = '';      
      });
    })
    /*== remove filter result list ==*/
    function clearList(filter) {
      while(filter.firstChild){filter.removeChild(filter.firstChild)}
    }  
    function pointPrefix(data) {
      switch (data) {  
        case 'Postomat':
        pointType = 'Поштомат';
          break;
        case 'Branch':
        pointType = 'Відділення';
          break;      
        default:
        pointType = data;
          break;
      }
      return pointType;
    }
    function stripslashes_n(str) {
      return str.replace(/'/g,`ʹ`);
    }   
    /*== search city  ==*/
    function searchCity() { 
      let linkClass = '';        
      let filter = document.querySelector('#city_filter');        
      let dataQuickCity;
      let quickOutput = '';
      let output_prev = 0;
      
      quickIndices.forEach(function(qСity, index){
        reqAPI({"apiKey": apiKey,"modelName": "Address","calledMethod": "searchSettlements","methodProperties": {"CityName" : qСity,"Limit" : "1","Page" : "1"}})
          .then(function(ress) {/*console.log(ress.data[0].Addresses[0])*/; dataQuickCity = ress.data[0].Addresses[0]; 
            quickOutput = `<a data-val='`+stripslashes_n(JSON.stringify(dataQuickCity))+`' class='quick-city-link' href='javascript:void(0)' style='display:block; order:`+index+`;'>`+ dataQuickCity.MainDescription + `</a>`;
            document.querySelector('.quick-city-wrap').insertAdjacentHTML('afterbegin',quickOutput);
          })
            .catch();     
      })


      setTimeout( function() {
        document.querySelectorAll('a.quick-city-link').forEach(function(city){
          city.addEventListener("click", function(){  //click
            clearCity.classList.remove('d-none');
            inputWarehouse.readOnly = false;
            document.querySelectorAll(".form-group").forEach(function(el){
              if (!el.classList.contains('form-city')) {              
                el.querySelector('input.form-control').value = '';
                el.querySelector('.clear') ? el.querySelector('.clear').classList.add('d-none') : null;
                if (deliveryType == 'branch')  checkoutButtonWrapper.classList.add('tool');
              }
            })

            cityData = JSON.parse(this.getAttribute('data-val'));          
            addressCity                     = cityData.MainDescription;          
            inputCity.value                 = cityData.Present;
            properties._delivery_city       = cityData.Present;
            properties._delivery_city_Ref   = cityData.DeliveryCity;
            updateCartDeliveryAttr(properties).then(function(cart) {/*console.log(cart)*/}).catch(alert);
            clearList(filter);
            
              if (deliveryType == 'branch' && cityData.DeliveryCity ) {              
                reqAPI({"apiKey": apiKey,"modelName": "Address","calledMethod": "getWarehouses","methodProperties": {"CityRef" : cityData.DeliveryCity }})
                  .then(function(res) {console.log(res.data); dataWarehouses = res.data; searchWarehouse(dataWarehouses); })
                    .catch(alert);                  
              } else if (deliveryType == 'courier' && cityData.DeliveryCity) {
                searchStreet(cityData.DeliveryCity);
              } else {
                return;
              }
          })

        })

      }, 1500)

      inputCity.addEventListener("keyup", function(event){   
        console.log('key-'+event.key); 
        if(event.key != 'ArrowLeft' && event.key != 'ArrowRight') {  
          let searchField = this.value;
          inputWarehouse.value = inputStreet.value = '';
          inputWarehouse.readOnly = false;
          document.getElementById('warehouse_filter').classList.remove('active'); 
          document.getElementById('street_filter').classList.remove('active');
          if (deliveryType == 'branch')  checkoutButtonWrapper.classList.add('tool');
          clearCity.classList.remove('d-none');

          if(searchField === '' || searchField === ' ' ){ clearList(filter);bodyNP.classList.remove('filter-active');cityErrorEl.innerHTML = '';clearCity.classList.add('d-none'); output_prev=0; return;} 
          let output = '', count = 1;

          reqAPI({"apiKey": apiKey,"modelName": "Address","calledMethod": "searchSettlements","methodProperties": {"CityName" : searchField,"Limit" : "150","Page" : "1"}})
            .then(function(res) {console.log(res.data[0].Addresses); dataCities = res.data[0].Addresses;
              if(dataCities.length > 0) { clearList(filter); cityErrorEl.innerHTML = '';} else { if(output_prev>0) cityErrorEl.innerHTML = alertCity }; })
              .catch( function() {console.log('error');clearList(filter); cityErrorEl.innerHTML.innerHTML = alertKeyboard });
              
              

          setTimeout( function() {
            if (dataCities.length > 0) {
              dataCities.forEach(function(val){          
                  linkClass = (val.Warehouses == 0 && deliveryType == 'branch' ) ? 'd-none' : '';
                  output += `<a data-val='`+stripslashes_n(JSON.stringify(val))+`' class='city-link `+ linkClass +`' href='javascript:void(0)' style='display:block;'>`+ val.Present + `</a>`;
                  if (count%1 == 0) output += '';
                  count++; 
              });
            }
            
            filter.insertAdjacentHTML('afterbegin',output);
            if (output_prev > 0) {
            bodyNP.classList.add('filter-active');
            document.getElementById('city_filter').classList.add('active');  
            }
            document.querySelectorAll('a.city-link').forEach(function(city){
              city.addEventListener("click", function(){
                bodyNP.classList.remove('filter-active');
                document.querySelector('.city-wrap .input-error').innerHTML = "";           
                cityData = JSON.parse(this.getAttribute('data-val'));          
                addressCity                     = cityData.MainDescription;          
                inputCity.value                 = cityData.Present;
                properties._delivery_city       = cityData.Present;
                properties._delivery_city_Ref   = cityData.DeliveryCity;
                updateCartDeliveryAttr(properties).then(function(cart) {/*console.log(cart)*/}).catch(alert);
                clearList(filter)
                
                  if (deliveryType == 'branch' && cityData.DeliveryCity ) {              
                    reqAPI({"apiKey": apiKey,"modelName": "Address","calledMethod": "getWarehouses","methodProperties": {"CityRef" : cityData.DeliveryCity }})
                      .then(function(res) {/*console.log(res.data);*/dataWarehouses = res.data; searchWarehouse(dataWarehouses); })
                        .catch(alert);                  
                  } else if (deliveryType == 'courier' && cityData.DeliveryCity) {
                    searchStreet(cityData.DeliveryCity);
                  } else {
                    return;
                  } 
              });
            })
            output_prev = output.length ; 
          }, 500)
        }
      });
    }
    /*== search branch/postomat  ==*/
    function searchWarehouse(data) {
      wrapWarehouse.classList.remove('d-none');      
      let filter = document.querySelector('#warehouse_filter');    
      if(data.length > 0) {

        inputWarehouse.addEventListener("keyup", function(event){

          if(event.key != 'ArrowLeft' && event.key != 'ArrowRight') {

            clearWarehouse.classList.remove('d-none');
            
            let searchField = this.value;
            if(searchField === '')  {
              clearList(filter);
              return;
            }        
            let regex = new RegExp(searchField, "i"), output = '', count = 1;
            
            data.forEach(function(val){        
              if ((val.Description.search(regex) != -1)) {
                output += `<a data-val='`+stripslashes_n(JSON.stringify(val))+`' class='warehouse-link' href='javascript:void(0)' style='display:block;'>` + val.Description + `</a>`;
                  if(count%1 == 0) output += '';
                    count++;
              } 
              checkoutButton.classList.add('disabled');
                checkoutButtonWrapper.classList.add('tool');
                  checkoutButton.disabled = true;        
            }); 
          
            if(output.length > 0) { clearList(filter); warehouseErrorEl.innerHTML = '';} else {warehouseErrorEl.innerHTML = alertWarehouse; };

            filter.insertAdjacentHTML('afterbegin',output);
            let warehousesLinks = document.querySelectorAll('a.warehouse-link');
            if(warehousesLinks.length > 0) {
              document.getElementById('warehouse_filter').classList.add('active');
            }      

            warehousesLinks.forEach(function(warehouse){

              warehouse.addEventListener("click", function(el){
                warehouseData = JSON.parse(this.getAttribute('data-val'));
                warehouseErrorEl.innerHTML = '';
                addressStreet = warehouseData.Description;
                inputWarehouse.value = addressStreet;
                inputWarehouse.readOnly = true;
                addressZip = warehouseData.PostalCodeUA;
                addressZip = '12345';
                addressBuild = addressFlat = '';            
                clearList(filter);
                properties._delivery_warehouse                 = addressStreet;
                properties._delivery_warehouse_zip             = addressZip;
                properties._delivery_warehouse_name            = pointPrefix(warehouseData.CategoryOfWarehouse)+':'+warehouseData.Number;
                properties._delivery_warehouse_address         = warehouseData.ShortAddress;
                properties._delivery_warehouse_CityRef         = warehouseData.CityRef;
                properties._delivery_warehouse_Number          = warehouseData.Number;
                properties._delivery_warehouse_Ref             = warehouseData.Ref;
                properties._delivery_warehouse_SettlementRef   = warehouseData.SettlementRef;
                properties._delivery_warehouse_TypeOfWarehouse = warehouseData.TypeOfWarehouse;          
                
              updateCartDeliveryAttr(properties).then(function(cart) {/*console.log(cart)*/}).catch(alert);
                checkoutButton.classList.remove('disabled');
                checkoutButtonWrapper.classList.remove('tool');
                checkoutButton.disabled = false;
                if(pageType == 'sidebar') document.querySelector('.qsc2-side-feature-btn[data-name="shipping"] .qsc2-side-feature-btn__wrapper span').innerHTML = addressCity +', '+pointPrefix(warehouseData.CategoryOfWarehouse)+' '+warehouseData.Number;
              });

            })

          }

        });
      } else {
        checkoutButton.classList.remove('disabled');
        checkoutButtonWrapper.classList.remove('tool');
        checkoutButton.disabled = false;
      }
    }
    /*== search street  ==*/
    function searchStreet(city) {  
      wrapAddresses.classList.remove('d-none');
      dataStreet = false;
      let streetPref;
      let output_prev = 0;
      inputStreet.addEventListener("keyup", function(event){
        if(event.key != 'ArrowLeft' && event.key != 'ArrowRight') {
          clearStreet.classList.remove('d-none');
          var filter = document.querySelector('#street_filter');  
          var searchField = this.value;
          if(searchField === '' || searchField.includes('&#8291;') || searchField === ' ')  {
            clearList(filter); clearStreet.classList.add('d-none'); streetErrorEl.innerHTML = ''; return;
          }
          if(searchField.includes(streetPref))  {          
            this.value = searchField.split(streetPref)[1];
          }  
        
          
          reqAPI({"apiKey": apiKey,"modelName": "Address","calledMethod": "getStreet","methodProperties": {"CityRef" : city,"FindByString" : this.value,"Page" : "1","Limit" : ""}})
            .then(function(res) {/*console.log(res.data);*/dataStreet = res.data;})
              .catch(function() {clearList(filter); streetErrorEl.innerHTML = alertKeyboard }); 
          
          var output = '';
          var count = 1;
            
          setTimeout( function() {
            dataStreet.forEach(function(val){ 		  
                output += '<a data-ref="'+val.Ref+'" data-street="'+ val.StreetsType + val.Description +'" data-prefix="'+val.StreetsType+'" class="street-link" href="javascript:void(0)" style="display:block;">' + val.StreetsType + val.Description + '</a>';
                count++;
            });

            if(dataStreet.length > 0 ) {clearList(filter); streetErrorEl.innerHTML = '';} else { if(output_prev > 0) streetErrorEl.innerHTML = alertStreet};
            filter.insertAdjacentHTML('afterbegin',output);

            let streetLinks = document.querySelectorAll('a.street-link');
            if(streetLinks.length > 0) {
              document.getElementById('street_filter').classList.add('active');
            }   
            streetLinks.forEach(function(street){
              street.addEventListener("click", function(el){
                addressStreet = this.getAttribute('data-street');
                inputStreet.value=this.getAttribute('data-street');
                streetPref = this.getAttribute('data-prefix');
                addressZip ='12345';
                clearList(filter);
                properties._delivery_courier_address    = addressStreet;
                properties._delivery_street             = addressStreet;
                properties._delivery_street_Ref         = this.getAttribute('data-ref');

              updateCartDeliveryAttr(properties).then(function(cart) {/*console.log(cart)*/}).catch(alert);

                checkoutButton.classList.remove('disabled');
                checkoutButtonWrapper.classList.remove('tool');
                checkoutButton.disabled = false;
                return;
              });
            })
          output_prev = output.length ;        
          },500);
        }
      });

      inputStreet.addEventListener("focusout", function(){
        if(this.value || this.value != '') {
          addressStreet = 'вул.'+this.value;
          properties._delivery_courier_address  = addressStreet;
          properties._delivery_street           = addressStreet;
          updateCartDeliveryAttr(properties).then(function(cart) {/*console.log(cart)*/}).catch(alert);
        }
      })      
    }
    /*== input build  ==*/
    inputBuild.addEventListener("keyup", function(){
      addressBuild = ', буд.'+this.value;
    })
    inputBuild.addEventListener("focusout", function(){
      addressStreet = addressStreet+''+addressBuild;
      properties._delivery_courier_address = addressStreet;
      properties._delivery_house           = addressBuild;
      updateCartDeliveryAttr(properties).then(function(cart) {/*console.log(cart)*/}).catch(alert);
    });
    /*== input flat  ==*/
    inputFlat.addEventListener("keyup", function(){
      addressFlat = ', кв.'+this.value;
    })
    inputFlat.addEventListener("focusout", function(){
      addressStreet = addressStreet+''+addressFlat;
      properties._delivery_courier_address = addressStreet;
      properties._delivery_flat            = addressFlat;
    updateCartDeliveryAttr(properties).then(function(cart) {/*console.log(cart)*/}).catch(alert);
    });
    function addErrorMessage() {
      const errorContainer = document.querySelector('.cart-terms .alert-danger');
        
        if (!errorContainer) return false;
      
        if (errorContainer && !(errorContainer.getAttribute('added-text'))) {
            errorContainer.innerHTML += ` ${translations?.shipping_method?.title}`;
        
          errorContainer.setAttribute('added-text', 'true');
          
          return true;
        }
    }
    const errorInterval = setInterval(() => {
      const isSet = addErrorMessage();

      if (isSet !== false) clearInterval(errorInterval);
    }, 100);  
    checkoutButton.addEventListener('click', async function(e) {

      let shouldDisable = true;	
      if (shouldDisable) this.classList.add('disabled');
      
      e.preventDefault();
      this.disabled = true;     

      addressStreet = (addressStreet)?addressStreet:'';
      addressCity = (addressCity)?addressCity:'';
      addressZip = '12345';
        const address = ({
          address1: (deliveryType == 'branch') ? pointPrefix(warehouseData.CategoryOfWarehouse)+' '+warehouseData.Number : addressStreet+' ('+methodCourier+')',
          zip: addressZip, 
          city: addressCity,
          country: country
        });
      setTimeout( function() {
      fetch(`${cartUrl}.json`).then(response => response.json()).then(data => {
          const pairs = [];
          
          const path = data.items.map(item => {
            return `${item.variant_id}:${item.quantity}`;
          }).join(',');

          for (var key in properties) {
            const value = properties[key];

            if (!value) continue;

            const pair = `attributes[${key}]=${properties[key]}`;

            pairs.push(pair);
          }

          for (var key in address) {
            const value = address[key];

            if (!value) continue;

            const pair = `checkout[shipping_address][${key}]=${address[key]}`;

            pairs.push(pair);
          }

          let query;
          let url;
          if (data.note && data.note != null) {
          query = pairs.join('&') + `&note=${data.note}`;
          url = `${cartUrl}/${path}?${query}`;
          } else {
          query = pairs.join('&');  
          url = `${cartUrl}/${path}?${query}`;
          }
          window.location.href = url;

        })
        
      
      
      },200); 
        
    });
    searchCity();
  } else {
    errorAPI();
  }
})
.catch(err => {  
  errorAPI();  
})

}

