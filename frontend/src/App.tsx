import React from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_SKILLS = gql`
  query GetSkills {
    skills {
      name
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_SKILLS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>SaGa Frontier2 術・技連携ビジュアライザー</h1>
      <ul>
        {data.skills.map((skill: { name: string; category: string }) => (
          <li key={skill.name}>
            {skill.name} 
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
