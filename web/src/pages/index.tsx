import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useEventsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import { Link } from '@chakra-ui/core';

const Index = () => {
  const [{ data }] = useEventsQuery();
  return (
    <Layout>
      <NextLink href="/create-event">
        <Link>create event</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.events.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
