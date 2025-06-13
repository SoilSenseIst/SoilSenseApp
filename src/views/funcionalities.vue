<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import logo from './logo.png';
import arrow from './arrow.png';


const router = useRouter();
const Home = () => router.push('/');

</script>


<template>
  <main>
    <header>
      <img :src="logo" alt="SoilSense Logo" class="logo-img" />
      <h2>User Guide</h2>
    </header>

     <div class="profile-circle" @click="Home">
      <img :src="arrow" alt="Adicionar dispositivo" />
    </div>

    <form>
    <p class="title"> Welcome to SoilSense.</p>

    <p class="title">Getting started: Connecting your devices </p>

    <p class="subtitle">Add Additional Devices</p>
    <p class="text"> You can monitor multiple locations or crops.
      To add a new device click the plus (+) icon on your home page and enter your device details (device ID,
      and device key).
    </p>

    <p class="title">Understanding your Dashboard</p>

    <p class="subtitle">Home Page Overview</p>
    <p class="text">
      Your home page displays the most recent sensor readings, including: atmospheric conditions (temperature and humidity) and the level of nutrients in the soil
      (Nitrogen, Phosphorus, Potassium). It also shows a irrigation graph, that includes both the water used to irrigate the crops and the quantity of fertilizers used.
    </p>

    <p class="subtitle">Reading Your Data Charts</p>
    <p class="text">
      The first chart shows atmospheric conditions, temperature and humidity levels.
      The second chart displays soil nutrient levels, Nitrogen, Phosphorus, and Potassium (NPK) readings.
      The third chart displays the irrigation data, showing the amount of water and nutrients used in each cycle. The second chart shows atmospheric conditions, including temperature and humidity levels.
    </p>

    <p class="title">Customizing Your Irrigation System</p>

    <p class="subtitle">Irrigation Settings (Pencil icon)</p>
    <p class="text">
      Take control of your watering system by adjusting: water and fertilizers used in each irrigation cycle.<br>
      Choose how many times per day you want to irrigate, based on your crop needs.<br>
    </p>

    <p class="title">Staying Informed</p>

    <p class="subtitle">Messages and Alerts</p>
    <p class="text">
      Alerts when irrigation motors fail to operate.<br>
      Notifications about excess or insufficient water and nutrient levels.<br>
      Alerts when the app fails to receive data from your device.
    </p>

    <p class="subtitle"> For further assistance, please contact our support team. </p>
</form>

  </main>
</template>


<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--primary-dark);
  color: #F3F4F6;
  padding: 2rem;
}

header {
  padding: 1.5rem;
}

.logo-img {
  width: 50px;
  height: auto;
}

h2{
    font: 2.15rem;
    margin-top: 1rem;
}

h2 ~ p {
    font-weight: 500;
    font-size: 2em;
    margin-top: 1rem;
}

b {
    font-weight: 500;
    font-size: 1rem;
    margin-top: 1rem;
    font-style: bold;
}

.profile-circle img { 
  width: 24px; 
  height: 24px; 
  object-fit: contain; 
}

.profile-circle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s;
}

.profile-circle:hover {
  background-color: #f0f0f0;
}

form {
  flex: 1 1 0%;
  display: block;
  border-radius: 1.5rem 1.5rem 1.5rem 1.5rem ;
  background-color: #F3F4F6;
  box-shadow: 0px -4px 12px 4px rgba(0,0,0,0.16);
  color: var(--dark);
  padding: 1.5rem 1.5rem;
  width: 100%;
  font-size: 1rem;
}

.title {
  font-weight: bold;
  font-size: 1.5rem;
  padding: 2rem 1rem 0.5rem 1rem;
}

.subtitle {
  font-weight: bold;
  font-size: 1rem;
  padding: 1rem 1rem 0.5rem 1rem;
}

.text {
  font-size: 1rem;
  padding: 0rem 1rem ;
}


</style>