import { NavBar } from '../components/NavBar';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useRecipesQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = useRecipesQuery();
  return (
    <>
      <NavBar />
      <div>hello world</div>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.recipes.map((q) => <div key={q.id}>{q.title}</div>)
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
