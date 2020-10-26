import { Link } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { Layout } from '../components/Layout';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  return (
    <Layout>
      <NextLink href="/create-event">
        <Link>create event</Link>
      </NextLink>
      <br />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
