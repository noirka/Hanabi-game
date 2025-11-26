import React, { useState } from 'react';

const AuthForm = ({ type }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isLogin = type === 'login';

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${type} submitted:`, { username, email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
        
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Ім'я користувача</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none w-full"
        >
          {isLogin ? 'Увійти' : 'Зареєструватися'}
        </button>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Немає облікового запису? " : "Вже маєте обліковий запис? "}
          {/* У реальному застосунку: Link to /signup або /login */}
          <a href="#" className="text-red-600 hover:text-red-800">
            {isLogin ? 'Реєстрація' : 'Вхід'}
          </a>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;