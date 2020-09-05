import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, GoogleMapsAPIWrapper } from '@agm/core';
import { FormGroup, FormControl } from '@angular/forms';
import { User } from './model/user.model';
import { MessageService, MenuItem } from 'primeng/api';
import { Ticket, SubTicket } from './model/ticket.model';
import { JourneyOption, JourneySubOption } from './model/journeyOptions.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'NavigatorApp';

  //private mapsAPILoader: MapsAPILoader;
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  @ViewChild('search')
  public searchElementRef: ElementRef;
  @ViewChild('search1')
  public searchElementRef1: ElementRef;

  @ViewChild('myPanel')
  public myPanel: ElementRef;
  @ViewChild('mainMapContainer')
  public mainMapContainer: ElementRef;

  markerIcon = {
    url: './assets/icons/marker-icon.png',
    scaledSize: {
      width: 50,
      height: 50
    }
  };


  lat: Number = 24.799448
  lng: Number = 120.979021

  origin: any;
  destination: any;

  travelMode = '';
  distance = '';
  travelTime = '';
  fare = '';
  journeyInfo = '';

  display: boolean = false;
  displayLogOut = false;
  displayTicket = false;
  displayPayment = false;
  signInPaymentFlow = false;

  signInForm = new FormGroup({
    'email': new FormControl(''),
    'password': new FormControl(''),
  });

  public users = new Array<User>();
  isUserLogged = false;

  value: number = 0;
  isJourneyCompleted = false;
  isJourneyStarted = false;
  ticketInfoBody = false;

  loggedUser: User = new User();


  from = '';
  to = '';
  ticket: Ticket = new Ticket();
  allTickets: Array<Ticket> = new Array<Ticket>();
  routeDirections: Array<any> = new Array<any>();
  indexRouteDirections: Array<any> = new Array<any>();

  myMap: any;
  public renderOptions = {
    suppressMarkers: true,
  }

  journeyOptions = new Array<JourneyOption>();

  public markerOptions = {
    origin: {
      //icon: 'https://www.shareicon.net/data/32x32/2016/04/28/756617_face_512x512.png',
      draggable: false,
    },
    destination: {
      //icon: 'https://www.shareicon.net/data/32x32/2016/04/28/756626_face_512x512.png',
      //label: 'MARKER LABEL',
      //opacity: 0.8,
      draggable: false,
    },
  }

  selectedJourneyOption: JourneyOption = new JourneyOption();

  latestTicketId = 1003;

  displayIndex = false;
  done = false;

  routeItemsinOrder: MenuItem[];


  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone, private messageService: MessageService,
    private gmapsApi: GoogleMapsAPIWrapper
  ) { }

  onSignIn() {


    let formData = this.signInForm.value;
    console.warn(this.signInForm.value);
    this.loggedUser = this.users.filter(x => x.Email == formData.email && x.Password == formData.password)[0];
    if (this.loggedUser === undefined) {
      alert('No user found.');
      this.display = false;
      this.isUserLogged = false;
      sessionStorage.setItem('isUserLogged', 'false');
      sessionStorage.removeItem('userInfo');

    }
    else {
      sessionStorage.setItem('isUserLogged', 'true');
      sessionStorage.setItem('userInfo', JSON.stringify(this.loggedUser));
      this.isUserLogged = true;
      this.display = false;
      if (this.signInPaymentFlow) {
        this.displayPayment = true;
      }
    }
  }


  ngOnInit() {



    this.setAllUsers();
    this.checkUserLoggingOnLoad();

 

    this.mapsAPILoader.load().then(() => {




      this.setCurrentLocation();

      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      let autocomplete1 = new google.maps.places.Autocomplete(this.searchElementRef1.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();

          // this.latitude = 12.9569;
          // this.longitude = 77.7011;

          this.zoom = 16;
          //this.origin = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
          this.origin = { lat: 12.960326, lng: 77.7002027 };
          //let place1: google.maps.places.PlaceResult = this.origin;
          this.from = this.searchElementRef.nativeElement.value;

        });
      });

      autocomplete1.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete1.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 16;
          this.destination = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };

          this.to = place.formatted_address;

          this.routeDirections = [];
          this.routeDirections.push({
            origin: { lat: 12.950487, lng: 77.7046279 }, destination: { lat: 12.9599867, lng: 77.7010464 }, renderOptions: {
              polylineOptions: {
                strokeColor: '#92D81E', strokeWeight: 5,
                strokeOpacity: 1
              }
            }
          });
          this.routeDirections.push({
            origin: { lat: 12.9599867, lng: 77.7010464 }, destination: { lat: 12.985032, lng: 77.645839 }, renderOptions: {
              polylineOptions: {
                strokeColor: '#1D7FFF', strokeWeight: 5,
                strokeOpacity: 1
              }
            }
          });
          this.routeDirections.push({
            origin: { lat: 12.985032, lng: 77.645839 }, destination: { lat: 12.9752936, lng: 77.6057533 }, renderOptions: {
              polylineOptions: {
                strokeColor: '#233389', strokeWeight: 5,
                strokeOpacity: 1
              }
            }
          });


          this.getJourneyOptions();



          let directionsService = new google.maps.DirectionsService();
          var request = {
            origin: this.origin,
            destination: this.destination,
            travelMode: google.maps.TravelMode.TRANSIT,
            provideRouteAlternatives: true
          };
          directionsService.route(request, function (response, status) {

            if (status == google.maps.DirectionsStatus.OK) {
              let directionR = new google.maps.DirectionsRenderer({ suppressMarkers: true });
              //let map = directionR.getMap();
              //console.log(localStorage.getItem('map'));
              //directionR.setMap(new Map<Element>localStorage.getItem('map'));
              //directionR.setDirections(response);




              //  for (var i = 0, len = response.routes.length; i < len; i++) {
              //   directionR.setDirections(response.routes[i].legs[0].);
              //  }

              //   //this.buildMultipleRoutes(response['routes']);

              // }
              //console.log(this.routeDirections);
              //alert();
            } else {
              console.log("directionsService : " + status);
            }
          });

          // let service = new google.maps.DistanceMatrixService();
          // service.getDistanceMatrix(
          //   {
          //     origins: [new google.maps.LatLng(this.origin.lat,this.origin.lng)],
          //     destinations: [new google.maps.LatLng(this.destination.lat,this.destination.lng)],
          //     travelMode: google.maps.TravelMode.TRANSIT,
          //   }, (resp)=>{
          //     //console.clear();
          //     //console.log(resp);
          //     this.travelMode = "Bus";
          //     this.distance = resp.rows[0].elements[0].distance.text;
          //     this.travelTime =resp.rows[0].elements[0].duration.text;
          //     this.fare = "15 INR";
          //     let currentTime = new Date();
          //     var dt = new Date();
          //     dt.setMinutes( currentTime.getMinutes() + (resp.rows[0].elements[0].duration.value/60) );
          //     this.journeyInfo = currentTime.toLocaleTimeString() + "-" + dt.toLocaleTimeString();

          //   });

          this.openSidePanel();
        });
      });
    });
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        // this.latitude = position.coords.latitude;
        // this.longitude = position.coords.longitude;

        this.latitude = 12.950487;
        this.longitude = 77.7046279;
        //console.log(`place ${this.latitude} and ${this.longitude}`)
        this.origin = { lat: this.latitude, lng: this.longitude };

        this.zoom = 8;


        this.getAddress(this.latitude, this.longitude);
        //console.log(abc);
      });
    }
  }

  getTravelOptions(mode: string) {


    if (mode == "metro") {
      let service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(this.origin.lat, this.origin.lng)],
          destinations: [new google.maps.LatLng(this.destination.lat, this.destination.lng)],
          travelMode: google.maps.TravelMode.TRANSIT,
        }, (resp, status) => {
          if (status == 'OK') {
            this.travelMode = "Metro";
            this.distance = resp.rows[0].elements[0].distance.text;
            this.travelTime = resp.rows[0].elements[0].duration.text;
            this.fare = resp.rows[0].elements[0].fare.value + " INR";
            let currentTime = new Date();
            //var newDateObj = new Date(currentTime + (30*60000)).toLocaleTimeString();

            var dt = new Date();
            dt.setMinutes(currentTime.getMinutes() + (resp.rows[0].elements[0].duration.value / 60));

            this.journeyInfo = currentTime.toLocaleTimeString() + "-" + dt.toLocaleTimeString();

          }

        });
    }
    else if (mode == "bus") {
      let service1 = new google.maps.DistanceMatrixService();
      service1.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(this.origin.lat, this.origin.lng)],
          destinations: [new google.maps.LatLng(this.destination.lat, this.destination.lng)],
          travelMode: google.maps.TravelMode.DRIVING,
        }, (resp, status) => {
          if (status == 'OK') {
            this.travelMode = "Bus";
            this.distance = resp.rows[0].elements[0].distance.text;
            this.travelTime = resp.rows[0].elements[0].duration.text;
            this.fare = "100 INR";
            let currentTime = new Date();
            var dt = new Date();
            dt.setMinutes(currentTime.getMinutes() + (resp.rows[0].elements[0].duration.value / 60));
            this.journeyInfo = currentTime.toLocaleTimeString() + "-" + dt.toLocaleTimeString();

          }

        });
    }
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 16;
          this.address = results[0].formatted_address;
          this.searchElementRef.nativeElement.value = this.address;
          this.from = this.address.substring(0, 30);
          //this.ngOnInit();
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  markerDragEnd($event: google.maps.MouseEvent) {

    this.latitude = $event.latLng.lat();
    this.longitude = $event.latLng.lng();
    //this.destination = { lat: this.latitude, lng: this.longitude };

    this.getAddress(this.latitude, this.longitude);
  }

  reserve(journey: JourneyOption) {
    this.selectedJourneyOption = journey;
    if (sessionStorage.getItem('isUserLogged') == 'true') {
      //this.displayTicket = true;
      // this.displayTicket = true;
      //this.to = this.
      this.displayPayment = true;
      this.loggedUser = JSON.parse(sessionStorage.getItem('userInfo'));
      this.signInPaymentFlow = false;
    }
    else {
      this.signInPaymentFlow = true;
      this.display = true;
    }

  }

  setAllUsers() {

    let user1 = new User();
    user1.Id = 1;
    user1.Name = 'Anshu Singh';
    user1.Email = 'anshurajlive@gmail.com';
    user1.Password = 'Anshu@123';
    user1.Age = 29;
    user1.Tickets.push({
      TicketId: 1001,
      TicketNumber: "1001",
      Owner: "Anshu Singh",
      JourneyTiming: "10:35:25 PM-11:09:25 PM",
      ValidFrom: "Your Place",
      ValidTo: "MG Road Metro Stationd",
      Fare: 65,
      FareCurrency: "INR",
      RouteId: 1,
      Route: "1",
      //TransportationMode: ['Bus'],
      PaymentStatus: "Paid",
      Status: "Completed",
      Review: 3,
      SubTickets: [{
        TicketId: 10010,
        TicketNumber: "10010",
        ValidFrom: "Your Place",
        ValidTo: "Marathahalli Kalamandir",
        Review: null,
        TransportationMode: "YULU"
      },
      {
        TicketId: 10011,
        TicketNumber: "10011",
        ValidFrom: "Marathahalli Kalamandir",
        ValidTo: "Swami Vivekananda Metro St",
        Review: null,
        TransportationMode: "Bus"
      },
      {
        TicketId: 10012,
        TicketNumber: "10012",
        ValidFrom: "Swami Vivekananda Metro St",
        ValidTo: "MG Road Metro Stationd",
        Review: null,
        TransportationMode: "Metro"
      }]
    });


    let user2 = new User();
    user2.Id = 2;
    user2.Name = 'Himanshu Raj';
    user2.Email = 'raj4arci@gmail.com';
    user2.Password = 'Password@123';
    user2.Age = 33;
    user2.Tickets.push({
      TicketId: 1002,
      TicketNumber: "1002",
      Owner: "Anshu Singh",
      JourneyTiming: "10:35:25 PM-11:09:25 PM",
      ValidFrom: "Marathalli Bridge, S",
      ValidTo: "Majestic, Bengaluru, Karnataka, India",
      Fare: 15,
      FareCurrency: "INR",
      RouteId: 1,
      Route: "1",
      PaymentStatus: "Paid",
      Status: "Completed",
      Review: 5,
      SubTickets: [{
        TicketId: 10020,
        TicketNumber: "10020",
        ValidFrom: "Your Place",
        ValidTo: "Marathahalli Kalamandir",
        Review: null,
        TransportationMode: "YULU"
      },
      {
        TicketId: 10021,
        TicketNumber: "10021",
        ValidFrom: "Marathahalli Kalamandir",
        ValidTo: "Swami Vivekananda Metro St",
        Review: null,
        TransportationMode: "Bus"
      },
      {
        TicketId: 10022,
        TicketNumber: "10022",
        ValidFrom: "Swami Vivekananda Metro St",
        ValidTo: "MG Road Metro Stationd",
        Review: null,
        TransportationMode: "Metro"
      }]
    });

    this.users.push(user1);
    this.users.push(user2);

  }

  closeSignIn() {
    this.display = false;
  }

  closeMyProfile() {
    this.displayLogOut = false;
  }

  closePayment() {
    //this.displayTicket =false;
    this.displayPayment = false;
  }

  closeTicket() {
    //this.displayTicket =false;
    this.displayTicket = false;
  }

  startJourney() {
    this.isJourneyStarted = true;
    let interval = setInterval(() => {
      this.value = this.value + Math.floor(Math.random() * 10) + 1;
      if (this.value >= 100) {
        this.value = 100;
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Journey Completed' });
        clearInterval(interval);
        this.ticket.Status = "Completed";
        this.isJourneyCompleted = true;
        this.isJourneyStarted = false;
      }


    }, 500);


  }

  showSignIn() {
    if (sessionStorage.getItem('isUserLogged') == 'true') {
      this.loggedUser = JSON.parse(sessionStorage.getItem('userInfo'));
      let ratings = 0;
      let index = 0;
      this.loggedUser.Tickets.forEach(x => {
        if (x.Review != null) {
          ratings = ratings + x.Review;
          index++;
        }
      });
      let avgRating = Math.ceil(ratings / index);
      this.loggedUser.AverageRating = avgRating;
      this.displayLogOut = true;
    }
    else {
      this.display = true;
    }

  }

  onSignOut() {
    sessionStorage.removeItem('isUserLogged');
    window.location.reload();
  }

  pay(method: string) {

    this.ticket = new Ticket();
    let newTicketId = this.getLatestTicketNumber();

    this.ticket.TicketId = newTicketId;
    this.ticket.TicketNumber = newTicketId.toString();
    this.ticket.Owner = this.loggedUser.Name;

    let currentTime = new Date();
    let dt = new Date();
    dt.setMinutes(currentTime.getMinutes() + (parseFloat(this.selectedJourneyOption.JourneyTimeInMins)));
    this.journeyInfo = currentTime.toLocaleTimeString() + "-" + dt.toLocaleTimeString();

    this.ticket.JourneyTiming = this.journeyInfo;
    this.ticket.ValidFrom = this.selectedJourneyOption.ValidFrom;
    this.ticket.ValidTo = this.selectedJourneyOption.ValidTo;
    this.ticket.Fare = parseFloat(this.selectedJourneyOption.Fare);
    this.ticket.FareCurrency = this.selectedJourneyOption.Currency;
    this.ticket.RouteId = this.selectedJourneyOption.RouteId;
    this.ticket.Route = this.selectedJourneyOption.RouteId.toString();
    //this.ticket.TransportationMode = [];

    let index = 0;
    this.selectedJourneyOption.JourneySubOptions.forEach(x => {
      //this.ticket.TransportationMode.push(x.CommuteType.toString());
      this.ticket.SubTickets.push({
        TicketId: ((this.ticket.TicketId * 10 + index)), TicketNumber: ((this.ticket.TicketId * 10 + index)).toString(),
        ValidFrom: x.ValidFrom, ValidTo: x.ValidTo, Review: null, TransportationMode: x.CommuteType
      });
      index++;
    });
    this.ticket.PaymentStatus = "Paid";
    this.ticket.Status = "Confirmed";
    this.ticket.Review = null;

    let currentUser = this.users.filter(x => x.Id == this.loggedUser.Id)[0];
    currentUser.Tickets.push(this.ticket);
    this.loggedUser.Tickets.push(this.ticket);
    sessionStorage.removeItem('userInfo');
    sessionStorage.setItem('userInfo', JSON.stringify(this.loggedUser));
    this.displayPayment = false;
    this.displayTicket = true;

  }

  review(e) {

    this.ticket.Review = parseInt(e.target.value);

    // let currentUser = this.users.filter(x=>x.Id == this.loggedUser.Id)[0];
    //currentUser.Tickets.filter(x=>x.TicketId == this.ticket.TicketId)[0].Review = parseInt(e.target.value); 
    this.loggedUser.Tickets.filter(x => x.TicketId == this.ticket.TicketId)[0].Review = this.ticket.Review;

    sessionStorage.removeItem('userInfo');
    sessionStorage.setItem('userInfo', JSON.stringify(this.loggedUser));
    this.checkUserLoggingOnLoad();
    this.displayTicket = false;
    this.closeSidePanel();
    this.messageService.add({ severity: 'success', summary: 'Review', detail: 'Thank you for the review.' });

  }

  closeSidePanel() {
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("navigation").style.width = (window.screen.width).toString() + "px";
    document.getElementById("mainMapContainer").style.width = (window.screen.width).toString() + "px";
  }

  openSidePanel() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("navigation").style.width = (window.screen.width - 300).toString() + "px";
    document.getElementById("mainMapContainer").style.width = (window.screen.width - 300).toString() + "px";

  }

  getAllTickets(): Array<Ticket> {
    let tickets = [];
    this.users.forEach(x => {
      x.Tickets.forEach(z => {
        tickets.push(z);
      })
    });


    return tickets;
  }

  getLatestTicketNumber() {

    if (localStorage.getItem('latestticket')) {
      this.latestTicketId = parseInt(localStorage.getItem('latestticket')) + 1;
      localStorage.setItem('latestticket', this.latestTicketId.toString())
    }
    else {
      this.latestTicketId = 1003;
      localStorage.setItem('latestticket', this.latestTicketId.toString())
    }
    return this.latestTicketId;

  }



  getTicketsByUser(user: User): Array<Ticket> {
    let tickets = [];
    this.users.filter(x => x.Id == user.Id)[0].Tickets.forEach(x => {
      tickets.push(x);
    });

    return tickets;
  }

  showMyBookings() {

    

    this.closeSidePanel();
    if (sessionStorage.getItem('isUserLogged') == 'true') {
      this.loggedUser = JSON.parse(sessionStorage.getItem('userInfo'));
      if (document.getElementById("mySidenav1").style.width == "300px") {
        document.getElementById("mySidenav1").style.width = "0px";
        document.getElementById("navigation").style.width = (window.screen.width).toString() + "px";
        document.getElementById("mainMapContainer").style.width = (window.screen.width).toString() + "px";
      }
      else {
        document.getElementById("mySidenav1").style.width = "300px";
        document.getElementById("navigation").style.width = (window.screen.width - 300).toString() + "px";
        document.getElementById("mainMapContainer").style.width = (window.screen.width - 300).toString() + "px";
      }
    }
    else {
      this.display = true;
    }
  }

  checkUserLoggingOnLoad() {
    if (sessionStorage.getItem('isUserLogged') == 'true') {
      this.loggedUser = JSON.parse(sessionStorage.getItem('userInfo'));
    }
    else {
      //this.display = true;
    }
  }

  buildMultipleRoutes(routes: [any]) {
    this.routeDirections = [];
    routes.forEach(x => {
      this.routeDirections.push({ origin: x.legs[0].start_location, destination: x.legs[0].end_location })
    });
  }

  onMapReady(e) {
    this.myMap = e;
    localStorage.setItem('map', e);
  }

  getJourneyOptions() {

    this.journeyOptions = [];

    // Journey Option 1
    let jOption = new JourneyOption();
    jOption.JourneyId = 1;
    jOption.Fare = "65";
    jOption.Currency = "INR";
    jOption.JourneyTimeInMins = "65";
    jOption.Distance = "19.9 ";
    jOption.DistanceUnit = "km";
    jOption.ValidFrom = "Your Place";
    jOption.ValidTo = "MG Road Metro Station";
    jOption.RouteId = 1;

    let jSubOption = new JourneySubOption();
    jSubOption.CommuteType = "YULU";
    jSubOption.Fare = "10";
    jSubOption.Currency = "INR";
    jSubOption.JourneyTimeInMins = "10";
    jSubOption.Distance = "3.5";
    jSubOption.DistanceUnit = "km";
    jSubOption.ValidFrom = "Your Place";
    jSubOption.ValidTo = "Marathahalli Kalamandir";
    jOption.JourneySubOptions.push(jSubOption);

    let jSubOption1 = new JourneySubOption();
    jSubOption1.CommuteType = "Bus";
    jSubOption1.Fare = "37";
    jSubOption1.Currency = "INR";
    jSubOption1.JourneyTimeInMins = "37";
    jSubOption1.Distance = "10";
    jSubOption1.DistanceUnit = "km";
    jSubOption1.ValidFrom = "Marathahalli Kalamandir";
    jSubOption1.ValidTo = "Swami Vivekananda Metro St";
    jOption.JourneySubOptions.push(jSubOption1);

    let jSubOption2 = new JourneySubOption();
    jSubOption2.CommuteType = "Metro";
    jSubOption2.Fare = "18";
    jSubOption2.Currency = "INR";
    jSubOption2.JourneyTimeInMins = "18";
    jSubOption2.Distance = "6.4";
    jSubOption2.DistanceUnit = "km";
    jSubOption2.ValidFrom = "Swami Vivekananda Metro St";
    jSubOption2.ValidTo = "MG Road Metro Stationd";
    jOption.JourneySubOptions.push(jSubOption2);

    this.journeyOptions.push(jOption);

    //Journey Option 2

    let jOption1 = new JourneyOption();
    jOption1.JourneyId = 2;
    jOption1.Fare = "40";
    jOption1.Currency = "INR";
    jOption1.JourneyTimeInMins = "52";
    jOption1.Distance = "14.8";
    jOption1.DistanceUnit = "km";
    jOption1.ValidFrom = "Your Place";
    jOption1.ValidTo = "MG Road Metro Station";
    jOption1.RouteId = 2;

    let jSubOption3 = new JourneySubOption();
    jSubOption3.CommuteType = "YULU";
    jSubOption3.Fare = "10";
    jSubOption3.Currency = "INR";
    jSubOption3.JourneyTimeInMins = "5";
    jSubOption3.Distance = "1";
    jSubOption3.DistanceUnit = "km";
    jSubOption3.ValidFrom = "Your Place";
    jSubOption3.ValidTo = "Marathahalli Bridge";
    jOption1.JourneySubOptions.push(jSubOption3);

    let jSubOption4 = new JourneySubOption();
    jSubOption4.CommuteType = "Bus";
    jSubOption4.Fare = "20";
    jSubOption4.Currency = "INR";
    jSubOption4.JourneyTimeInMins = "42";
    jSubOption4.Distance = "12.8";
    jSubOption4.DistanceUnit = "km";
    jSubOption4.ValidFrom = "Marathahalli Bridge";
    jSubOption4.ValidTo = "Electric B St";
    jOption1.JourneySubOptions.push(jSubOption4);

    let jSubOption5 = new JourneySubOption();
    jSubOption5.CommuteType = "YULU";
    jSubOption5.Fare = "10";
    jSubOption5.Currency = "INR";
    jSubOption5.JourneyTimeInMins = "5";
    jSubOption5.Distance = "1";
    jSubOption5.DistanceUnit = "km";
    jSubOption5.ValidFrom = "Electric B St";
    jSubOption5.ValidTo = "MG Road Metro Station";
    jOption1.JourneySubOptions.push(jSubOption5);
    this.journeyOptions.push(jOption1);

    //Journey Option 3

    let jOption2 = new JourneyOption();
    jOption2.JourneyId = 3;
    jOption2.Fare = "15";
    jOption2.Currency = "INR";
    jOption2.JourneyTimeInMins = "45";
    jOption2.Distance = "13.7";
    jOption2.DistanceUnit = "km";
    jOption2.ValidFrom = "Your Place";
    jOption2.ValidTo = "MG Road Metro Station";
    jOption2.RouteId = 3;

    let jSubOption6 = new JourneySubOption();
    jSubOption6.CommuteType = "YULU";
    jSubOption6.Fare = "15";
    jSubOption6.Currency = "INR";
    jSubOption6.JourneyTimeInMins = "45";
    jSubOption6.Distance = "13.7";
    jSubOption6.DistanceUnit = "km";
    jSubOption6.ValidFrom = "Your Place";
    jSubOption6.ValidTo = "MG Road Metro Station";
    jOption2.JourneySubOptions.push(jSubOption6);
    this.journeyOptions.push(jOption2);

    //Journey Option 4

    let jOption3 = new JourneyOption();
    jOption3.JourneyId = 4;
    jOption3.Fare = "20";
    jOption3.Currency = "INR";
    jOption3.JourneyTimeInMins = "64";
    jOption3.Distance = "14.8";
    jOption3.DistanceUnit = "km";
    jOption3.ValidFrom = "Your Place";
    jOption3.ValidTo = "MG Road Metro Station";
    jOption3.RouteId = 4;

    let jSubOption3_1 = new JourneySubOption();
    jSubOption3_1.CommuteType = "Walk";
    jSubOption3_1.Fare = "0";
    jSubOption3_1.Currency = "INR";
    jSubOption3_1.JourneyTimeInMins = "10";
    jSubOption3_1.Distance = "1";
    jSubOption3_1.DistanceUnit = "km";
    jSubOption3_1.ValidFrom = "Your Place";
    jSubOption3_1.ValidTo = "Marathahalli Bridge";
    jOption3.JourneySubOptions.push(jSubOption3_1);

    let jSubOption3_2 = new JourneySubOption();
    jSubOption3_2.CommuteType = "Bus";
    jSubOption3_2.Fare = "20";
    jSubOption3_2.Currency = "INR";
    jSubOption3_2.JourneyTimeInMins = "42";
    jSubOption3_2.Distance = "12.8";
    jSubOption3_2.DistanceUnit = "km";
    jSubOption3_2.ValidFrom = "Marathahalli Bridge";
    jSubOption3_2.ValidTo = "Electric B St";
    jOption3.JourneySubOptions.push(jSubOption3_2);

    let jSubOption3_3 = new JourneySubOption();
    jSubOption3_3.CommuteType = "Walk";
    jSubOption3_3.Fare = "0";
    jSubOption3_3.Currency = "INR";
    jSubOption3_3.JourneyTimeInMins = "12";
    jSubOption3_3.Distance = "1";
    jSubOption3_3.DistanceUnit = "km";
    jSubOption3_3.ValidFrom = "Electric B St";
    jSubOption3_3.ValidTo = "MG Road Metro Station";
    jOption3.JourneySubOptions.push(jSubOption3_3);
    this.journeyOptions.push(jOption3);

  }

  buildIndexRoutes(e){
    this.indexRouteDirections = [];

    
    if(e == 1){
      //Route 1
      this.indexRouteDirections.push({
        origin: { lat: 12.950487, lng: 77.7046279 }, 
        destination: { lat: 12.9752936, lng: 77.6057533 }, 
        waypoints : [
          {location: { lat: 12.9599867, lng: 77.7010464 }, stopover: true},
          {location: { lat: 12.985032, lng: 77.645839 }, stopover: true},
        ], 
        renderOptions: {
          polylineOptions: {
            strokeColor: '#5193F6', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
    }
    else if(e == 2){
      //Route 2
    this.indexRouteDirections.push({
      origin: { lat: 12.950487, lng: 77.7046279 }, 
      destination: { lat: 12.9752936, lng: 77.6057533 }, 
      waypoints : [
        {location: { lat: 12.9567461, lng: 77.7007649 }, stopover: true},
        {location: { lat: 12.9737525, lng: 77.6133449 }, stopover: true},
      ], 
      renderOptions: {
        polylineOptions: {
          strokeColor: '#5193F6', strokeWeight: 5,
          strokeOpacity: 1
        }
      }
    });
    }
    else if(e == 3){
      //Route 3
     this.indexRouteDirections.push({
      origin: { lat: 12.950487, lng: 77.7046279 }, 
      destination: { lat: 12.9752936, lng: 77.6057533 }, 
      waypoints : [
        
      ], 
      renderOptions: {
        polylineOptions: {
          strokeColor: '#5193F6', strokeWeight: 5,
          strokeOpacity: 1
        }
      }
    });
    }
    else if(e == 4){
      //Route 4
     this.indexRouteDirections.push({
      origin: { lat: 12.950487, lng: 77.7046279 }, 
      destination: { lat: 12.9752936, lng: 77.6057533 }, 
      waypoints : [
        {location: { lat: 12.9567461, lng: 77.7007649 }, stopover: true},
        {location: { lat: 12.9737525, lng: 77.6133449 }, stopover: true},
      ], 
      renderOptions: {
        polylineOptions: {
          strokeColor: '#5193F6', strokeWeight: 5,
          strokeOpacity: 1
        }
      }
    });
    }
    


    setTimeout(() => { this.done = true; }, 1000);



    // this.indexRouteDirections.push({
    //   origin: { lat: 12.950487, lng: 77.7046279 }, destination: { lat: 12.9567461, lng: 77.7007649 }, renderOptions: {
    //     polylineOptions: {
    //       strokeColor: '#92D81E', strokeWeight: 5,
    //       strokeOpacity: 1
    //     }
    //   }
    // });
    // this.indexRouteDirections.push({
    //   origin: { lat: 12.9567461, lng: 77.7007649 }, destination: { lat: 12.9737525, lng: 77.6133449 }, renderOptions: {
    //     polylineOptions: {
    //       strokeColor: '#1D7FFF', strokeWeight: 5,
    //       strokeOpacity: 1
    //     }
    //   }
    // });
    // this.indexRouteDirections.push({
    //   origin: { lat: 12.9737525, lng: 77.6133449 }, destination: { lat: 12.9752936, lng: 77.6057533 }, renderOptions: {
    //     polylineOptions: {
    //       strokeColor: '#92D81E', strokeWeight: 5,
    //       strokeOpacity: 1
    //     }
    //   }
    // });

  }

  redrawRoute(e: JourneyOption) {

    this.routeDirections = [];
    if (e.JourneyId == 1) {

      this.routeDirections.push({
        origin: { lat: 12.950487, lng: 77.7046279 }, destination: { lat: 12.9599867, lng: 77.7010464 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#92D81E', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
      this.routeDirections.push({
        origin: { lat: 12.9599867, lng: 77.7010464 }, destination: { lat: 12.985032, lng: 77.645839 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#1D7FFF', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
      this.routeDirections.push({
        origin: { lat: 12.985032, lng: 77.645839 }, destination: { lat: 12.9752936, lng: 77.6057533 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#233389', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
    }
    else if (e.JourneyId == 2) {
      this.routeDirections.push({
        origin: { lat: 12.950487, lng: 77.7046279 }, destination: { lat: 12.9567461, lng: 77.7007649 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#92D81E', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
      this.routeDirections.push({
        origin: { lat: 12.9567461, lng: 77.7007649 }, destination: { lat: 12.9737525, lng: 77.6133449 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#1D7FFF', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
      this.routeDirections.push({
        origin: { lat: 12.9737525, lng: 77.6133449 }, destination: { lat: 12.9752936, lng: 77.6057533 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#92D81E', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
    }
    else if (e.JourneyId == 3) {

      this.routeDirections.push({
        origin: { lat: 12.950487, lng: 77.7046279 }, destination: { lat: 12.9754255, lng: 77.6060036 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#92D81E', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
    }
    else if (e.JourneyId == 4) {
      this.routeDirections.push({
        origin: { lat: 12.950487, lng: 77.7046279 }, destination: { lat: 12.9567461, lng: 77.7007649 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#b9a5d2', strokeWeight: 3,
            strokeOpacity: 1
          }
        }
      });
      this.routeDirections.push({
        origin: { lat: 12.9567461, lng: 77.7007649 }, destination: { lat: 12.9737525, lng: 77.6133449 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#1D7FFF', strokeWeight: 5,
            strokeOpacity: 1
          }
        }
      });
      this.routeDirections.push({
        origin: { lat: 12.9737525, lng: 77.6133449 }, destination: { lat: 12.9752936, lng: 77.6057533 }, renderOptions: {
          polylineOptions: {
            strokeColor: '#b9a5d2', strokeWeight: 3,
            strokeOpacity: 1
          }
        }
      });
    }
    else {
      alert("Not a valid journey");
    }

    this.zoom = 16;

  }

  sortJourney(sortBy: string) {

    if (sortBy == "time") {
      this.journeyOptions.sort((a, b) => parseFloat(a.JourneyTimeInMins) - parseFloat(b.JourneyTimeInMins));

    }
    else if (sortBy == "fare") {
      this.journeyOptions.sort((a, b) => parseFloat(a.Fare) - parseFloat(b.Fare));

    }
  }

  showIndex(){
    
    this.getJourneyOptions();
    let data = this.getRoutesInPreferenceOrder();
    let temp = [];
    const uniqueIds = [...new Set( data.map(obj => obj.routeId)) ];
    
    this.journeyOptions.forEach(x=>{
      let routeData = data.filter(t=>t.routeId == x.JourneyId);
      if(routeData.length > 0){
        let review = 0;
      let divIndex = 0;
      for(let i = 0; i <= routeData.length -1; i++){
        review = review + routeData[i].review;
        divIndex++;
      }
      let aReview = Math.ceil(review/divIndex);
      temp.push({routeId : x.RouteId, avgReview : aReview, ratedTimes : divIndex});
      }
      else{
        temp.push({routeId : x.RouteId, avgReview : 0, ratedTimes : 0});
      }
      temp.sort((a, b) => parseFloat(b.avgReview) - parseFloat(a.avgReview));
    });

    this.routeItemsinOrder = [];

    temp.forEach(x=>{

      this.routeItemsinOrder.push({
        label : " x " + x.avgReview + "  Route " + x.routeId + " & Rated " + x.ratedTimes + " times",
        icon:'pi pi-star, pi pi-star',
        id : x.routeId,
        command: (event) => this.redrawRouteForIndexing(event),
      })

      
    });

    this.displayIndex = true;
  }

  redrawRouteForIndexing(e){
    this.buildIndexRoutes(e.item.id);
  }

  getRoutesInPreferenceOrder(){
    let temp = [];

    let notMeUsers = this.users.filter(x=> x.Id != this.loggedUser.Id);

    notMeUsers.forEach(x=>{
      x.Tickets.forEach(ticket=>{
        if(ticket.Review != null){
          temp.push({routeId : ticket.RouteId, review : ticket.Review, user : x.Id})
        }
      })
    });

    this.loggedUser.Tickets.forEach(ticket=>{
      if(ticket.Review != null){
        temp.push({routeId : ticket.RouteId, review : ticket.Review, user : this.loggedUser.Id})
      }
    });
    return temp;
  }
}
