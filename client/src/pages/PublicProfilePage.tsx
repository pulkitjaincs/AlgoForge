import { useParams } from 'react-router-dom';

export const PublicProfilePage = () => {
  const { username } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{username}'s Profile</h1>
      <p>View public stats and heatmap data here.</p>
    </div>
  );
};
