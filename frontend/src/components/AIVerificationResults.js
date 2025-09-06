import React from 'react';
import { Card, Badge, ProgressBar, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import '../styles/AIVerificationResults.css';

const AIVerificationResults = ({ verification, document }) => {
  if (!verification) {
    return (
      <Alert variant="info">
        No verification results available for this document.
      </Alert>
    );
  }

  const getConfidenceVariant = (confidence) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'danger';
  };

  const getStatusBadge = (isAuthentic, confidence) => {
    if (isAuthentic && confidence >= 70) {
      return <Badge bg="success">Verified Authentic</Badge>;
    } else if (!isAuthentic) {
      return <Badge bg="danger">Rejected</Badge>;
    } else {
      return <Badge bg="warning">Needs Review</Badge>;
    }
  };

  const renderAnalysisSection = (title, analysis, variant = 'light') => {
    if (!analysis) return null;

    return (
      <Card className="mb-3">
        <Card.Header className={`bg-${variant}`}>
          <h6 className="mb-0">{title}</h6>
        </Card.Header>
        <Card.Body>
          {typeof analysis === 'object' ? (
            <pre className="analysis-json">{JSON.stringify(analysis, null, 2)}</pre>
          ) : (
            <p>{analysis}</p>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="ai-verification-results">
      <Card className="verification-summary mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">AI Verification Results</h5>
          {getStatusBadge(verification.isAuthentic, verification.confidence)}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="confidence-score mb-3">
                <label className="form-label">Confidence Score</label>
                <ProgressBar 
                  now={verification.confidence} 
                  variant={getConfidenceVariant(verification.confidence)}
                  label={`${verification.confidence}%`}
                  className="mb-2"
                />
                <small className="text-muted">
                  Threshold: 70% for authentic classification
                </small>
              </div>
            </Col>
            <Col md={6}>
              <div className="verification-details">
                <p><strong>Verified by:</strong> {verification.verifierName}</p>
                <p><strong>Verification Time:</strong> {new Date(verification.verificationTime).toLocaleString()}</p>
                {verification.verificationNotes && (
                  <p><strong>Notes:</strong> {verification.verificationNotes}</p>
                )}
              </div>
            </Col>
          </Row>

          {verification.flags && verification.flags.length > 0 && (
            <Alert variant="warning" className="mt-3">
              <strong>Flags Detected:</strong>
              <ul className="mb-0 mt-2">
                {verification.flags.map((flag, index) => (
                  <li key={index}>{flag.replace(/_/g, ' ')}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {verification.aiAnalysis && (
        <div className="detailed-analysis">
          <h6 className="mb-3">Detailed AI Analysis</h6>
          
          {/* OCR Analysis */}
          {verification.aiAnalysis.ocr && (
            <Card className="mb-3">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">OCR Analysis</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Success:</strong> {verification.aiAnalysis.ocr.success ? 'Yes' : 'No'}</p>
                    <p><strong>Confidence:</strong> {verification.aiAnalysis.ocr.confidence}%</p>
                    <p><strong>Word Count:</strong> {verification.aiAnalysis.ocr.wordCount}</p>
                  </Col>
                  <Col md={6}>
                    {verification.aiAnalysis.ocr.text && (
                      <div>
                        <strong>Extracted Text Preview:</strong>
                        <div className="extracted-text-preview">
                          {verification.aiAnalysis.ocr.text.substring(0, 200)}
                          {verification.aiAnalysis.ocr.text.length > 200 && '...'}
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Structure Analysis */}
          {verification.aiAnalysis.structure && (
            <Card className="mb-3">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">Document Structure Analysis</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Valid Structure:</strong> {verification.aiAnalysis.structure.valid ? 'Yes' : 'No'}</p>
                    <p><strong>Structure Score:</strong> {verification.aiAnalysis.structure.score}%</p>
                  </Col>
                  <Col md={6}>
                    {verification.aiAnalysis.structure.foundFields && (
                      <div>
                        <strong>Found Fields:</strong>
                        <ListGroup variant="flush" className="mt-2">
                          {Object.entries(verification.aiAnalysis.structure.foundFields).map(([field, found]) => (
                            <ListGroup.Item key={field} className="d-flex justify-content-between">
                              <span>{field.replace(/_/g, ' ').toUpperCase()}</span>
                              <Badge bg={found ? 'success' : 'danger'}>
                                {found ? 'Found' : 'Missing'}
                              </Badge>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Content Validation */}
          {verification.aiAnalysis.content && (
            <Card className="mb-3">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">Content Validation</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Valid Dates:</strong> {verification.aiAnalysis.content.hasValidDates ? 'Yes' : 'No'}</p>
                    <p><strong>Valid Names:</strong> {verification.aiAnalysis.content.hasValidNames ? 'Yes' : 'No'}</p>
                    <p><strong>Content Score:</strong> {verification.aiAnalysis.content.contentScore}%</p>
                  </Col>
                  <Col md={6}>
                    {verification.aiAnalysis.content.issues && verification.aiAnalysis.content.issues.length > 0 && (
                      <div>
                        <strong>Issues Found:</strong>
                        <ul className="mt-2">
                          {verification.aiAnalysis.content.issues.map((issue, index) => (
                            <li key={index} className="text-warning">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Fraud Detection */}
          {verification.aiAnalysis.fraud && (
            <Card className="mb-3">
              <Card.Header className="bg-danger text-white">
                <h6 className="mb-0">Fraud Detection Analysis</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Risk Score:</strong> {verification.aiAnalysis.fraud.riskScore}%</p>
                    <p><strong>Suspicious Patterns:</strong> {verification.aiAnalysis.fraud.suspiciousPatterns.length}</p>
                  </Col>
                  <Col md={6}>
                    {verification.aiAnalysis.fraud.suspiciousPatterns.length > 0 && (
                      <div>
                        <strong>Detected Patterns:</strong>
                        <ListGroup variant="flush" className="mt-2">
                          {verification.aiAnalysis.fraud.suspiciousPatterns.map((pattern, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between">
                              <span>{pattern.pattern}</span>
                              <Badge bg="warning">Risk: {pattern.risk}%</Badge>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Metadata Consistency */}
          {verification.aiAnalysis.metadata && (
            <Card className="mb-3">
              <Card.Header className="bg-secondary text-white">
                <h6 className="mb-0">Metadata Consistency</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Name Match:</strong> {verification.aiAnalysis.metadata.nameMatch ? 'Yes' : 'No'}</p>
                    <p><strong>Type Match:</strong> {verification.aiAnalysis.metadata.typeMatch ? 'Yes' : 'No'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Consistency Score:</strong> {verification.aiAnalysis.metadata.consistencyScore}%</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Score Breakdown */}
          {verification.details && (
            <Card className="mb-3">
              <Card.Header className="bg-dark text-white">
                <h6 className="mb-0">Score Breakdown</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(verification.details).map(([key, value]) => (
                    <Col md={6} key={key} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <span className={value < 0 ? 'text-danger' : 'text-success'}>
                          {value > 0 ? '+' : ''}{value.toFixed(1)}
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AIVerificationResults;