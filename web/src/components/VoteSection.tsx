import React, { useState } from 'react';
import { Flex, IconButton } from '@chakra-ui/core';
import { QuestionSnippetFragment, useVoteMutation } from '../generated/graphql';

interface VoteSectionProps {
  question: QuestionSnippetFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ question }) => {
  const [loadingState, setLoadingState] = useState<
    'vote-loading' | 'unvote-loading' | 'not-loading'
  >('not-loading');
  const [currentVote, setCurrentVote] = useState<'voted' | 'not-voted'>(
    'not-voted'
  );
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        variantColor={currentVote === 'voted' ? 'green' : undefined}
        onClick={async () => {
          setLoadingState('vote-loading');
          await vote({
            questionId: question.id,
            value: currentVote === 'not-voted' ? 1 : -1,
          });
          setLoadingState('not-loading');
          setCurrentVote(currentVote === 'not-voted' ? 'voted' : 'not-voted');
        }}
        isLoading={loadingState === 'vote-loading'}
        aria-label="upvote question"
        icon="chevron-up"
      />
      {question.points}
    </Flex>
  );
};
