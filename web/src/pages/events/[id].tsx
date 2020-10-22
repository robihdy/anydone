import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { Layout } from '../../components/Layout';
import { useQuestionsQuery } from '../../generated/graphql';

const Event: NextPage<{ id: string }> = ({ id }) => {
  const [variables, setVariables] = useState({
    eventId: parseInt(id),
    limit: 10,
    cursor: null as null | string,
  });

  console.log(variables);

  const [{ data, fetching }] = useQuestionsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>you got query failed for some reason!</div>;
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>Event Title</Heading>
        <NextLink href="/create-question">
          <Link ml="auto">Ask a Question</Link>
        </NextLink>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.questions.questions.map((q) => (
            <Box key={q.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{q.authorName}</Heading>
              <Text mt={4}>{q.description}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data && data.questions.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                eventId: variables.eventId,
                limit: variables.limit,
                cursor:
                  data.questions.questions[data.questions.questions.length - 1]
                    .createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

Event.getInitialProps = ({ query }) => {
  return {
    id: query.id as string,
  };
};

export default withUrqlClient(createUrqlClient)(Event);
