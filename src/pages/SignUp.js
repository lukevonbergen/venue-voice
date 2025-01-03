import React, { useState } from 'react';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Step 1: Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    // Step 2: Create a record in the venues table
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .insert([{ name, email }]) // Insert name and email only
      .select()
      .single();

    if (venueError) {
      setError(venueError.message);
      return;
    }

    console.log('User and venue created successfully:', authData.user, venueData);
    navigate('/dashboard'); // Redirect to the dashboard after successful sign-up
  };

  return (
    <div style={styles.container}>
      <h2>Venue Sign Up</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Venue Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};

export default SignUpPage;