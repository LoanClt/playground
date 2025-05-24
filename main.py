import streamlit as st
import streamlit_authenticator as stauth

# Example credentials
usernames = ['user']
passwords = stauth.Hasher(['password']).generate()
names = ['Demo User']

# Create the authenticator object
authenticator = stauth.Authenticate(
    names,
    usernames,
    passwords,
    'some_cookie_name',
    'some_signature_key',
    cookie_expiry_days=1
)

name, authentication_status, username = authenticator.login('Login', 'main')

if authentication_status:
    st.title('My First Streamlit App')
    st.write(f'Welcome, {name}!')
    number = st.slider('Pick a number', 0, 100, 50)
    st.write(f'You selected: {number}')
    authenticator.logout('Logout', 'sidebar')
elif authentication_status is False:
    st.error('Username or password is incorrect')
elif authentication_status is None:
    st.warning('Please enter your username and password')
