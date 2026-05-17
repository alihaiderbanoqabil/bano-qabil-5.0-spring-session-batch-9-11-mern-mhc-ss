import React from 'react'
import { useFetch } from '../hooks/useFetch'
import { useParams } from 'react-router-dom'
import { Todos } from './Todos'

export const Posts = () => {
  const { userId } = useParams()

  const { data: posts, error, isLoading } = useFetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)


  if (isLoading) {
    return <h2>Loading posts...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="users-container">
      {posts.map((post) => (
        <div className="user-card" key={post.id}>
          <h2>{post.title}</h2>
          <p>
            <strong>Description:</strong> {post.body}
          </p>

          <button
            onClick={() => navigate(`/users/${user?.id}`, { replace: false, state: user })}
            className="profile-btn"
          >
            View Post
          </button>
        </div>
      ))}
    </div>
  );
}
