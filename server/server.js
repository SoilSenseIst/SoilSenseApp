import express from 'express';
import stytch from 'stytch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const client = new stytch.Client({
  project_id: process.env.PROJECT_ID,
  secret: process.env.SECRET,
  env: stytch.envs.test, 
});


const port = process.env.PORT || 3333;

app.use(cors({
  origin: 'https://soilsenseapp.netlify.app/#/login', 
  credentials: true,
}));

app.use(express.json());

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try { 
        const resp = await client.passwords.create({
            email,
            password,
            session_duration_minutes: 60
        })

        res.json({
            success: true,
            message: 'User registered successfully',
            token: resp.session_token
        })
    }
    catch (err){
        console.log(err);

        res.json({
            success: false,
            message: err.error_message,
            err: err
        })
    }
})


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try { 
        const resp = await client.passwords.authenticate({
            email,
            password,
            session_duration_minutes: 60
        })

        res.json({
            success: true,
            message: 'User logged in successfully',
            token: resp.session_token
        })
    }
    catch (err){
        console.log(err);

        res.json({
            success: false,
            message: err.error_message,
            err: err
        })
    }
})

app.post('/profile', async (req, res) => {
    const { name, surname, user_id } = req.body;

    try {
        const resp = await client.users.update({
            user_id: user_id,
            name: {
                first_name: name,
                last_name: surname
            }
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            token: resp.session_token
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.error_message || 'Internal server error',
            error: err
        });
    }
<<<<<<< HEAD
})
=======
});
>>>>>>> 35eeb66226da85b8ac2f31a7ac1ba3cf36deb6f9


app.post('/authenticate', async (req, res) => {
    const { session_token } = req.body;

    try { 
        await client.sessions.authenticate({ session_token })
            
        res.json({
            success: true,
            message: 'Token is valid',
            token: resp.session_token
        })
    }
    catch (err){
        console.log(err);

        res.json({
            success: false,
            message: err.error_message,
            err: err
        })
    }
})

app.post('/logout', async (req, res) => {
    const { session_token } = req.body;

    try { 
        await client.sessions.revoke({ session_token })
            
        res.json({
            success: true,
            message: 'User logged out successfully',
        })
    }
    catch (err){
        console.log(err);

        res.json({
            success: false,
            message: err.error_message,
            err: err
        })
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});