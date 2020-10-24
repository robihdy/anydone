import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { InputField } from '../../components/InputField';
import { Layout } from '../../components/Layout';
import { VoteSection } from '../../components/VoteSection';
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useQuestionsQuery,
} from '../../generated/graphql';
import { cookies, setOptions } from '../../utils/cookies';
import { createUrqlClient } from '../../utils/createUrqlClient';

const Event: NextPage<{ id: string }> = ({ id }) => {
  const guestId = v4();
  if (!cookies.get('iask_guestId')) {
    cookies.set('iask_guestId', guestId, setOptions);
  }

  const [variables, setVariables] = useState({
    eventId: parseInt(id),
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = useQuestionsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>you got query failed for some reason!</div>;
  }

  const [, createQuestion] = useCreateQuestionMutation();
  const [, deleteQuestion] = useDeleteQuestionMutation();

  return (
    <Layout>
      <Flex align="center">
        <Heading>Event Title</Heading>
      </Flex>
      <br />
      <Formik
        initialValues={{
          authorName: '',
          description: '',
        }}
        onSubmit={async (values, { resetForm }) => {
          const { error, data } = await createQuestion({
            input: { ...values, eventId: parseInt(id) },
          });
          if (!error) {
            resetForm({});
            setVariables({
              eventId: parseInt(id),
              limit: 10,
              cursor: null as null | string,
            });
            cookies.set(
              `qauthor_${data?.createQuestion.id}`,
              cookies.get('iask_guestId'),
              setOptions
            );
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="authorName"
              placeholder="Your Name (optional)"
              label="Your Name"
            />
            <Box mt={4}>
              <InputField
                textarea
                name="description"
                placeholder="Type your question"
                label="Question"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Send
            </Button>
          </Form>
        )}
      </Formik>
      <br />
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.questions.questions.map((q) =>
            !q ? null : (
              <Flex key={q.id} p={5} shadow="md" borderWidth="1px">
                <VoteSection question={q} />
                <Box flex={1}>
                  <Heading fontSize="xl">{q.authorName}</Heading>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {q.description}
                    </Text>
                    {cookies.get(`qauthor_${q.id}`) ===
                      cookies.get('iask_guestId') && (
                      <IconButton
                        ml="auto"
                        variantColor="red"
                        icon="delete"
                        aria-label="Delete Post"
                        onClick={() => {
                          deleteQuestion({ id: q.id });
                        }}
                      />
                    )}
                  </Flex>
                </Box>
              </Flex>
            )
          )}
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

export default withUrqlClient(createUrqlClient, { ssr: false })(Event);
