import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { QRCodeSVG } from 'qrcode.react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Download } from 'lucide-react';
import Modal from 'react-modal';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [venueId, setVenueId] = useState(null);
  const [inactiveQuestions, setInactiveQuestions] = useState([]); // Previously used questions
  const [searchTerm, setSearchTerm] = useState(''); // Search term for inactive questions
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false); // Modal state
  const [selectedInactiveQuestion, setSelectedInactiveQuestion] = useState(null); // Inactive question to re-add
  const [pendingNewQuestion, setPendingNewQuestion] = useState('');
  const [replacementSource, setReplacementSource] = useState(null); // 'new' or 'inactive'
  const [duplicateError, setDuplicateError] = useState('');

  // Fetch venue ID and questions
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchVenueId(user.email);
      }
    };

    fetchSession();
  }, []);

  // Fetch venue ID
  const fetchVenueId = async (email) => {
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('email', email)
      .single();

    if (venueError) {
      console.error('Error fetching venue ID:', venueError);
    } else {
      setVenueId(venueData.id);
      fetchQuestions(venueData.id);
      fetchInactiveQuestions(venueData.id); // Fetch inactive questions
    }
  };

  // Fetch active questions for the venue
  const fetchQuestions = async (venueId) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('active', true)
      .order('order', { ascending: true });
  
    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data);
    }
  };

  // Fetch inactive questions for the venue
  const fetchInactiveQuestions = async (venueId) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('active', false); // Only fetch inactive questions

    if (error) {
      console.error('Error fetching inactive questions:', error);
    } else {
      setInactiveQuestions(data);
    }
  };

  // Add a new question
  const handleAddQuestion = async () => {
    // Check if the question limit (5) has been reached
    if (questions.length >= 5) {
      setPendingNewQuestion(newQuestion); // Store the new question for replacement
      setReplacementSource('new'); // Indicate that the replacement is coming from a new question
      setIsReplaceModalOpen(true); // Open the replace modal
      return;
    }
  
    // Validate the new question
    if (!newQuestion.trim()) {
      alert('Question cannot be empty.');
      return;
    }
  
    if (newQuestion.length > 100) {
      alert('Question cannot exceed 100 characters.');
      return;
    }
  
    // Check for duplicate question
    const isDuplicate = await checkForDuplicateQuestion(newQuestion);
    if (isDuplicate) {
      alert('This question already exists.');
      return;
    }
  
    // Add the new question to the database
    const { data, error } = await supabase
      .from('questions')
      .insert([{ venue_id: venueId, question: newQuestion, order: questions.length, active: true }])
      .select();
  
    if (error) {
      console.error('Error adding question:', error);
    } else {
      setQuestions([...questions, data[0]]); // Update the state with the new question
      setNewQuestion(''); // Clear the input field
    }
  };

  // Replace an active question with an inactive one
  const handleReplaceQuestion = async (questionIdToReplace) => {
    if (replacementSource === 'new' && !pendingNewQuestion.trim()) {
      alert('Please enter a question to add.');
      return;
    }
  
    if (replacementSource === 'inactive' && !selectedInactiveQuestion) {
      alert('Please select a question to re-add.');
      return;
    }
  
    // Check for duplicate question
    const questionToAdd = replacementSource === 'new' ? pendingNewQuestion : selectedInactiveQuestion.question;
    const isDuplicate = await checkForDuplicateQuestion(questionToAdd);
    if (isDuplicate) {
      alert('This question already exists. Please select a unique question.');
      return;
    }
  
    // Mark the selected active question as inactive
    await supabase
      .from('questions')
      .update({ active: false })
      .eq('id', questionIdToReplace);
  
    // Add the new question or re-add the inactive question
    if (replacementSource === 'new') {
      const { data, error } = await supabase
        .from('questions')
        .insert([{ venue_id: venueId, question: pendingNewQuestion, order: questions.length, active: true }])
        .select();
  
      if (error) {
        console.error('Error adding new question:', error);
      } else {
        // Update the state with the new question and remove the replaced question
        const updatedQuestions = questions.filter((q) => q.id !== questionIdToReplace);
        setQuestions([...updatedQuestions, data[0]]);
        setNewQuestion(''); // Clear the input field
      }
    } else if (replacementSource === 'inactive') {
      await supabase
        .from('questions')
        .update({ active: true, order: questions.length })
        .eq('id', selectedInactiveQuestion.id);
  
      // Refresh both active and inactive questions
      fetchQuestions(venueId);
      fetchInactiveQuestions(venueId);
    }
  
    // Reset states
    setPendingNewQuestion('');
    setSelectedInactiveQuestion(null);
    setReplacementSource(null);
    setIsReplaceModalOpen(false); // Close the modal
  };

  // Open the replace modal
  const openReplaceModal = (inactiveQuestion) => {
    if (questions.length >= 5) {
      setSelectedInactiveQuestion(inactiveQuestion); // Store the inactive question for replacement
      setReplacementSource('inactive'); // Indicate that the replacement is coming from an inactive question
      setIsReplaceModalOpen(true); // Open the replace modal
    } else {
      // If the limit is not met, directly add the inactive question
      handleAddInactiveQuestion(inactiveQuestion);
    }
  };
  
  const handleAddInactiveQuestion = async (inactiveQuestion) => {
    // Mark the inactive question as active
    const { error } = await supabase
      .from('questions')
      .update({ active: true, order: questions.length + 1 })
      .eq('id', inactiveQuestion.id);
  
    if (error) {
      console.error('Error re-adding inactive question:', error);
    } else {
      // Refresh both active and inactive questions
      fetchQuestions(venueId);
      fetchInactiveQuestions(venueId);
    }
  };

  const handleNewQuestionChange = (e) => {
    setNewQuestion(e.target.value); // Update the new question text
    setDuplicateError(''); // Clear any duplicate error message
  };

  const checkForDuplicateQuestion = async (questionText) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('question', questionText);
  
    if (error) {
      console.error('Error checking for duplicate question:', error);
      return false; // Assume no duplicate if there's an error
    }
  
    return data.length > 0; // Return true if a duplicate is found
  };

  // Close the replace modal
  const closeReplaceModal = () => {
    setIsReplaceModalOpen(false);
    setSelectedInactiveQuestion(null);
  };

  // Handle drag-and-drop reordering
  const onDragEnd = async (result) => {
    if (!result.destination) return; // Dropped outside the list
  
    const reorderedQuestions = Array.from(questions);
    const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedQuestion);
  
    // Update the order in the database
    const updates = reorderedQuestions.map((q, index) => ({
      id: q.id,
      order: index + 1, // Update the order based on the new position
    }));
  
    // Use `update` instead of `upsert`
    for (const update of updates) {
      const { error } = await supabase
        .from('questions')
        .update({ order: update.order })
        .eq('id', update.id);
  
      if (error) {
        console.error('Error updating question order:', error);
        return; // Stop further updates if an error occurs
      }
    }
  
    setQuestions(reorderedQuestions); // Update the state with the new order
  };

  // Start editing a question
  const startEditingQuestion = (questionId, questionText) => {
    setEditingQuestionId(questionId);
    setEditingQuestionText(questionText);
  };

  // Save edited question
  const saveEditedQuestion = async () => {
    if (!editingQuestionText.trim()) {
      alert('Question cannot be empty.');
      return;
    }

    if (editingQuestionText.length > 100) {
      alert('Question cannot exceed 100 characters.');
      return;
    }

    const { error } = await supabase
      .from('questions')
      .update({ question: editingQuestionText })
      .eq('id', editingQuestionId);

    if (error) {
      console.error('Error updating question:', error);
    } else {
      const updatedQuestions = questions.map((q) =>
        q.id === editingQuestionId ? { ...q, question: editingQuestionText } : q
      );
      setQuestions(updatedQuestions);
      setEditingQuestionId(null);
      setEditingQuestionText('');
    }
  };

  // Mark a question as inactive
  const handleDeleteQuestion = async (questionId) => {
    const { error } = await supabase
      .from('questions')
      .update({ active: false })
      .eq('id', questionId);

    if (error) {
      console.error('Error marking question as inactive:', error);
    } else {
      setQuestions(questions.filter((q) => q.id !== questionId));
      fetchInactiveQuestions(venueId); // Refresh inactive questions
    }
  };

  // Filter inactive questions based on search term
  const filteredInactiveQuestions = inactiveQuestions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Suggested questions for easy adding
  const suggestedQuestions = [
    'How was the service today?',
    'How would you rate the atmosphere?',
    'Was your order prepared correctly?',
    'How likely are you to recommend us?',
    'How clean was the venue?',
  ];

  // Generate the feedback URL for the venue
  const feedbackUrl = `${window.location.origin}/feedback/${venueId}`;

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Manage Questions</h1>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-600 font-medium">Questions Active: {questions.length}/5</span>
          </div>
        </div>
  
        {/* QR Code Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Feedback QR Code</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-shrink-0" ref={qrCodeRef}>
                <QRCodeSVG value={feedbackUrl} size={200} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Feedback Link</h3>
                <p className="text-gray-600 mb-4">Scan this QR code or share the link below to collect customer feedback.</p>
                <a
                  href={feedbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {feedbackUrl}
                </a>
              </div>
            </div>
            {/* Download QR Code Button */}
            <button
              onClick={downloadQRCode}
              className="mt-4 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Download QR Code</span>
            </button>
          </div>
        </div>
  
        {/* Suggested Questions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Suggested Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedQuestions.map((question, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors duration-200"
                onClick={() => setNewQuestion(question)}
              >
                <p className="text-gray-700">{question}</p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Add New Question */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Question</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter a new question"
                value={newQuestion}
                onChange={handleNewQuestionChange}
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={100}
              />
              <button
                onClick={handleAddQuestion}
                className={`${
                  questions.length >= 5
                    ? 'bg-gray-500 hover:bg-gray-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-6 py-3 rounded-lg transition-colors duration-200`}
              >
                {questions.length >= 5 ? 'Replace...' : 'Add Question'}
              </button>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">{newQuestion.length}/100 characters</p>
              {duplicateError && <p className="text-sm text-red-500">{duplicateError}</p>}
              {questions.length >= 5 && (
                <p className="text-sm text-red-500">Maximum questions limit reached (5/5)</p>
              )}
            </div>
          </div>
        </div>
  
        {/* Current Questions */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Current Questions</h2>
          <p className="text-sm text-gray-400 mb-4">
            You can drag and drop these questions in the order your customers will answer them.
          </p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {questions.map((q, index) => (
                    <Draggable key={q.id} draggableId={q.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                          {editingQuestionId === q.id ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                              <input
                                type="text"
                                value={editingQuestionText}
                                onChange={(e) => setEditingQuestionText(e.target.value)}
                                className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                maxLength={100}
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={saveEditedQuestion}
                                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingQuestionId(null)}
                                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                              <p className="text-gray-700 text-lg">{q.question}</p>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => startEditingQuestion(q.id, q.question)}
                                  className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
  
        {/* Previously Used Questions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Previously Used Questions</h2>
          <input
            type="text"
            placeholder="Search previously used questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInactiveQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors duration-200"
                onClick={() => openReplaceModal(q)}
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">{q.question}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReplaceModal(q);
                    }}
                    className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Replace Modal */}
        <Modal
          isOpen={isReplaceModalOpen}
          onRequestClose={closeReplaceModal}
          contentLabel="Replace Question Modal"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h2 className="text-xl font-bold mb-4">Replace Question</h2>
          {replacementSource === 'new' && (
            <p className="mb-4">You are adding: "{pendingNewQuestion}"</p>
          )}
          {replacementSource === 'inactive' && (
            <p className="mb-4">You are re-adding: "{selectedInactiveQuestion?.question}"</p>
          )}
          <p className="mb-4">Select a question to replace:</p>
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors duration-200"
                onClick={() => handleReplaceQuestion(q.id)}
              >
                <p className="text-gray-700">{q.question}</p>
              </div>
            ))}
          </div>
          <button
            onClick={closeReplaceModal}
            className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
        </Modal>
      </div>
    </DashboardFrame>
  );
};

export default ManageQuestions;