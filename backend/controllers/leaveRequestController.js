import LeaveRequest from '../models/LeaveRequest.js';

// @desc    Get all leave requests
// @route   GET /api/leave-requests
// @access  Private/Admin
export const getLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({})
      .populate('member', 'name email')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a leave request as reviewed
// @route   PATCH /api/leave-requests/:id/reviewed
// @access  Private/Admin
export const markLeaveRequestReviewed = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = 'reviewed';
    await leaveRequest.save();

    res.json({ message: 'Leave request marked as reviewed', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
