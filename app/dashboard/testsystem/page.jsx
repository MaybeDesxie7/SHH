'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '@/styles/test.css';

export default function TestSystem() {
  const [level, setLevel] = useState('beginner');
  const [category, setCategory] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTestId, setUserTestId] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const categories = [
    'Writer',
    'Digital Marketer',
    'Designer',
    'Developer',
    'Content Creator',
    'Entrepreneur / E-commerce Specialist'
  ];

  const [eligibleLevels, setEligibleLevels] = useState(['beginner']);

  useEffect(() => {
    fetchEligibleLevels();
  }, []);

  async function fetchEligibleLevels() {
    const { data: ebooksRead } = await supabase
      .from('ebooks')
      .select('level')
      .eq('is_paid', false); // replace with actual read ebooks logic
    const levels = [...new Set(ebooksRead?.map(e => e.level))];
    setEligibleLevels(levels.length > 0 ? levels : ['beginner']);
  }

  async function startTest() {
    if (!category) return alert('Select a category');
    if (!eligibleLevels.includes(level)) return alert(`You must read a ${level} ebook to take this test`);

    const { data: userResponse } = await supabase.auth.getUser();
    const userId = userResponse.user.id;

    const { data: test, error } = await supabase
      .from('user_tests')
      .insert([{ user_id: userId, ebook_level: level, niche: category }])
      .select('*')
      .single();
    if (error) return console.error(error);

    setUserTestId(test.id);

    // Fetch ebooks for this category + level
    const { data: ebooks } = await supabase
      .from('ebooks')
      .select('id')
      .eq('category', category)
      .eq('level', level);

    const ebookIds = ebooks.map(e => e.id);
    if (!ebookIds.length) return alert('No ebooks available for this category and level.');

    // Fetch 50 random questions
    const { data: qData } = await supabase
      .from('ebook_questions')
      .select('*')
      .in('ebook_id', ebookIds)
      .limit(50);

    const questionsToInsert = qData.map(q => ({ user_test_id: test.id, question_id: q.id }));
    await supabase.from('user_test_questions').insert(questionsToInsert);

    setQuestions(qData);
    setTestStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
  }

  async function answerQuestion(option) {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (option === currentQ.answer) setScore(prev => prev + 1);

    await supabase
      .from('user_test_questions')
      .update({ user_answer: option, answered: true })
      .eq('user_test_id', userTestId)
      .eq('question_id', currentQ.id);

    if (currentIndex + 1 >= questions.length) finishTest();
    else setCurrentIndex(prev => prev + 1);
  }

  async function finishTest() {
    setFinished(true);
    setTestStarted(false);

    const { data: userResponse } = await supabase.auth.getUser();
    const userId = userResponse.user.id;

    await supabase
      .from('user_tests')
      .update({ finished: true, score })
      .eq('id', userTestId);

    if (score >= 30) {
      const badgeLabel = `${level.charAt(0).toUpperCase() + level.slice(1)} ${category}`;

      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('niche', category)
        .single();

      if (existingBadge) {
        const levels = ['beginner','intermediate','advanced'];
        if (levels.indexOf(level) > levels.indexOf(existingBadge.level)) {
          await supabase.from('user_badges').update({ level }).eq('id', existingBadge.id);
        }
      } else {
        await supabase.from('user_badges').insert([{ user_id: userId, niche: category, level }]);
      }
    }
  }

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && testStarted) window.location.reload();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [testStarted]);

  if (!testStarted) {
    return (
      <div className="test-container">
        <h1 className="title">Knowledge Test</h1>
        <div className="test-controls">
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)}>
            {['beginner','intermediate','advanced'].map(l => (
              <option key={l} value={l} disabled={!eligibleLevels.includes(l)}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={startTest}>Start Test</button>
        </div>
        {finished && <p className="score-display">Your Score: {score}/{questions.length}</p>}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="test-container">
      <h2 className="question-header">Question {currentIndex + 1} of {questions.length}</h2>
      <p className="question-text">{currentQuestion.question}</p>
      <div className="options">
        {Object.entries(currentQuestion.options).map(([key, text]) => (
          <button key={key} onClick={() => answerQuestion(key)} className="option-button">
            {key}: {text}
          </button>
        ))}
      </div>
      <p className="score-display">Score: {score}</p>
    </div>
  );
}
