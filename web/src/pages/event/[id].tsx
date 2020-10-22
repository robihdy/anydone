import React from 'react';
import { NextPage } from 'next';
import { Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { Layout } from '../../components/Layout';
import { useQuestionsQuery } from '../../generated/graphql';

const Event: NextPage<{ id: string }> = ({ id }) => {
  const [{ data }] = useQuestionsQuery({
    variables: {
      eventId: parseInt(id),
      limit: 10,
    },
  });

  return (
    <Layout>
      <NextLink href="/create-event">
        <Link>create event</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.questions.map((q) => <div key={q.id}>{q.description}</div>)
      )}
    </Layout>
  );
};

Event.getInitialProps = ({ query }) => {
  return {
    id: query.id as string,
  };
};

export default withUrqlClient(createUrqlClient)(Event);
