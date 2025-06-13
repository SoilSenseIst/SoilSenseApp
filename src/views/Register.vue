<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import logo from './logo.png';

const router = useRouter();

const email = ref("");
const password = ref("");
const conf_password = ref("");
const loading = ref(false);

const Register = async () => {
  if (!email.value || !password.value || !conf_password.value) {
    alert("Please fill all the fields.");
    return;
  }

  if (password.value !== conf_password.value) {
    alert("Passwords do not match.");
    return;
  }

  loading.value = true;

  try {
    const response = await fetch("https://soilsenseserver.onrender.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("session_token", data.token);
      localStorage.setItem("email", email.value); // ✅ salva email
      router.push("/profile");
    } else {
      alert(data.message || "Registration failed.");
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main>
    <header>
      <img :src="logo" alt="SoilSense Logo" class="logo-img" />
      <h2>Register</h2>
      <p>Login or create an account to start using the SoilSense app</p>
    </header>

    <form @submit.prevent="Register">
      <label>
        <span>Enter your email</span>
        <box>
          <input type="email" v-model="email" placeholder="JonhSmith@test.com" />
        </box>
      </label>

      <label>
        <span>Enter your password</span>
        <box>
          <input type="password" v-model="password" placeholder="***************" />
        </box>
      </label>

      <label>
        <span>Confirm your password</span>
        <box>
          <input type="password" v-model="conf_password" placeholder="***************" />
        </box>
      </label>

      <input
        type="submit"
        :value="loading ? 'Registering...' : 'Register'"
        :disabled="loading"
      />
    </form>

    <footer>
      <p>
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>
    </footer>
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
  width: 50px; /* ou qualquer valor como 50%, 10rem, etc. */
  height: auto; /* mantém a proporção */
}

footer {
  background-color: #F3F4F6;
  width: 100%;
  color: var(--dark);
  text-align: center;
  padding: 1.5rem;
  padding-bottom: 2rem;
  border-radius: 0rem 0rem 1.5rem 1.5rem;
}

h2 {
  font: 2.15rem;
  margin-top: 1rem;
}

h2 ~ p {
  font-weight: 500;
  font-size: 1rem;
  margin-top: 1rem;
}

form {
  flex: 1 1 0%;
  display: block;
  border-radius: 1.5rem 1.5rem 0 0;
  background-color: #F3F4F6;
  box-shadow: 0px -4px 12px 4px rgba(0, 0, 0, 0.16);
  color: var(--dark);
  padding: 4rem 1.5rem;
  width: 100%;
}

label {
  display: block;
  margin-bottom: 1.5rem;
}

label span {
  display: block;
  color: var(--blue);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

label box {
  display: block;
  color: var(--blue);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  border-radius: 1.5rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

input:not([type="submit"]) {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
  padding: 1.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--dark);
  background-color: #F3F4F6;
}

input:not([type="submit"])::placeholder {
  color: var(--blue);
  font-style: italic;
}

input[type="submit"] {
  display: block;
  width: fit-content;
  margin: 0 auto;
  font-size: 1.5rem;
  font-weight: 500;
  color: #F3F4F6;
  background-color: var(--primary-dark);
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: 0.2s ease;
}

input[type="submit"]:hover {
  background-color: var(--primary);
}
</style>
